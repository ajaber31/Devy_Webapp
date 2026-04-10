import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getDocumentSignedUrl } from '@/lib/supabase/storage'
import { extractText } from '@/lib/document-processing/parser'
import { chunkText } from '@/lib/document-processing/chunker'
import { generateEmbeddings } from '@/lib/document-processing/embedder'
import { checkRateLimit, PROCESS_LIMIT } from '@/lib/rate-limit'
import type { Database } from '@/lib/supabase/database.types'

// Allow up to 5 minutes on Vercel Pro — ignored locally
export const maxDuration = 300

const CHUNK_INSERT_BATCH = 50

/** Service-role Supabase client — bypasses RLS for pipeline mutations. */
function serviceDb() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function updateStatus(
  db: ReturnType<typeof serviceDb>,
  id: string,
  status: Database['public']['Tables']['documents']['Update']['status'],
  extra: Database['public']['Tables']['documents']['Update'] = {},
) {
  await db.from('documents').update({ status, ...extra }).eq('id', id)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // --- Auth: verify the caller is an admin via session cookie ---
  const cookieStore = await cookies()
  const authClient = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // read-only in API routes
      },
    },
  )

  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await authClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Rate limit: max 5 processing jobs per admin per minute (expensive pipeline)
  const rl = checkRateLimit(`process:${user.id}`, PROCESS_LIMIT)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many processing requests. Please wait before retrying.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAtMs - Date.now()) / 1000)) },
      },
    )
  }

  // --- Fetch the document record ---
  const db = serviceDb()
  const { data: doc, error: fetchError } = await db
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  if (doc.status === 'ready') {
    return NextResponse.json({ message: 'Already processed' })
  }

  // --- Step 1: Parse ---
  await updateStatus(db, id, 'parsing')

  let buffer: Buffer
  try {
    const { url, error: urlError } = await getDocumentSignedUrl(doc.storage_path)
    if (urlError || !url) throw new Error(urlError ?? 'No signed URL')

    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to download file: ${response.status}`)

    const arrayBuffer = await response.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await updateStatus(db, id, 'failed', { error_message: `Parse stage: ${msg}` })
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  let text: string
  try {
    const result = await extractText(buffer, doc.file_type)
    text = result.text
    if (!text.trim()) throw new Error('No text extracted — file may be empty or image-only')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await updateStatus(db, id, 'failed', { error_message: `Text extraction: ${msg}` })
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // --- Step 2: Chunk ---
  await updateStatus(db, id, 'chunking')

  const chunks = chunkText(text)
  if (chunks.length === 0) {
    await updateStatus(db, id, 'failed', { error_message: 'Chunking produced no output' })
    return NextResponse.json({ error: 'No chunks produced' }, { status: 500 })
  }

  // --- Step 3: Embed ---
  await updateStatus(db, id, 'embedding')

  const { embeddings, error: embedError } = await generateEmbeddings(
    chunks.map(c => c.content),
  )
  if (embedError) {
    await updateStatus(db, id, 'failed', { error_message: `Embedding: ${embedError}` })
    return NextResponse.json({ error: embedError }, { status: 500 })
  }

  // --- Step 4: Insert chunks in batches ---
  const rows = chunks.map((chunk, i) => ({
    document_id: id,
    chunk_index: chunk.index,
    content: chunk.content,
    embedding: JSON.stringify(embeddings[i]),
    metadata: {
      char_start: chunk.charStart,
      char_end: chunk.charEnd,
      approx_tokens: chunk.approxTokens,
    },
  }))

  for (let i = 0; i < rows.length; i += CHUNK_INSERT_BATCH) {
    const batch = rows.slice(i, i + CHUNK_INSERT_BATCH)
    const { error: insertError } = await db.from('document_chunks').insert(batch)
    if (insertError) {
      await updateStatus(db, id, 'failed', { error_message: `Chunk insert: ${insertError.message}` })
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  // --- Step 5: Mark ready ---
  await updateStatus(db, id, 'ready', {
    chunk_count: chunks.length,
    processed_at: new Date().toISOString(),
    error_message: null,
  })

  return NextResponse.json({ success: true, chunks: chunks.length })
}
