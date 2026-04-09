import { createClient as createServiceClient } from '@supabase/supabase-js'
import { chunkText } from '@/lib/document-processing/chunker'
import { generateEmbeddings } from '@/lib/document-processing/embedder'
import type { Database } from '@/lib/supabase/database.types'
import type { PubMedSource } from './pubmed'

const CHUNK_INSERT_BATCH = 50

function serviceDb() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

/**
 * Ingest PubMed abstracts into the KB so future queries hit the DB
 * instead of calling PubMed again. Deduplicates by PMID tag.
 *
 * Intended to run fire-and-forget — never await this in the chat hot path.
 */
export async function ingestPubMedSources(sources: PubMedSource[]): Promise<void> {
  const db = serviceDb()

  for (const source of sources) {
    try {
      await ingestOne(db, source)
    } catch (err) {
      console.error(`[pubmed-ingest] Failed to ingest PMID ${source.pmid}:`, err)
    }
  }
}

async function ingestOne(
  db: ReturnType<typeof serviceDb>,
  source: PubMedSource,
): Promise<void> {
  const pmidTag = `pmid:${source.pmid}`

  // ── Deduplication — skip if already ingested and ready ───────────────────
  const { data: existing } = await db
    .from('documents')
    .select('id, status')
    .contains('tags', [pmidTag])
    .maybeSingle()

  if (existing?.status === 'ready') return

  // ── Build document text — use full text if available, else abstract ──────
  const bodyText = source.fullText ?? source.abstract
  const text = [
    source.title,
    `Authors: ${source.authors}`,
    `Journal: ${source.journal} (${source.year})`,
    `PMID: ${source.pmid}`,
    source.pmcid ? `PMCID: PMC${source.pmcid}` : '',
    '',
    bodyText,
  ].filter(Boolean).join('\n')

  // ── Create document record ────────────────────────────────────────────────
  const { data: doc, error: insertError } = await db
    .from('documents')
    .insert({
      title: source.title,
      original_filename: `pubmed-${source.pmid}.txt`,
      file_type: 'txt',
      storage_path: `pubmed/${source.pmid}`,
      tags: ['pubmed-auto', 'peer-reviewed', pmidTag],
      status: 'embedding',
      uploaded_by: null,
    })
    .select('id')
    .single()

  if (insertError || !doc) {
    console.error(`[pubmed-ingest] Insert failed for PMID ${source.pmid}:`, insertError?.message)
    return
  }

  const docId = doc.id

  // ── Chunk ─────────────────────────────────────────────────────────────────
  const chunks = chunkText(text)
  const contents = chunks.map(c => c.content)

  // ── Embed ─────────────────────────────────────────────────────────────────
  const { embeddings, error: embedError } = await generateEmbeddings(contents)

  if (embedError || embeddings.length === 0) {
    await db.from('documents').update({ status: 'failed', error_message: embedError ?? 'Embedding failed' }).eq('id', docId)
    return
  }

  // ── Insert chunks in batches ──────────────────────────────────────────────
  const chunkRows = chunks.map((chunk, i) => ({
    document_id: docId,
    chunk_index: i,
    content: chunk.content,
    embedding: JSON.stringify(embeddings[i]),
    metadata: {
      char_start: chunk.charStart,
      char_end: chunk.charEnd,
      approx_tokens: chunk.approxTokens,
    },
  }))

  for (let i = 0; i < chunkRows.length; i += CHUNK_INSERT_BATCH) {
    const batch = chunkRows.slice(i, i + CHUNK_INSERT_BATCH)
    const { error: batchError } = await db.from('document_chunks').insert(batch)
    if (batchError) {
      console.error(`[pubmed-ingest] Chunk insert error for PMID ${source.pmid}:`, batchError.message)
      await db.from('documents').update({ status: 'failed', error_message: batchError.message }).eq('id', docId)
      return
    }
  }

  // ── Mark ready ────────────────────────────────────────────────────────────
  await db.from('documents').update({
    status: 'ready',
    chunk_count: chunkRows.length,
    processed_at: new Date().toISOString(),
  }).eq('id', docId)
}
