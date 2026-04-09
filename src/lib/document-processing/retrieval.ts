import { createClient } from '@/lib/supabase/server'
import { generateEmbeddings } from './embedder'

export interface ChunkSearchOptions {
  topK?: number       // default 8
  threshold?: number  // cosine similarity minimum, default 0.10
  tags?: string[]     // filter to documents tagged with any of these
}

export interface RetrievedChunk {
  id: string
  documentId: string
  chunkIndex: number
  content: string
  similarity: number
  metadata: {
    pageNumber?: number
    section?: string
    sourceLabel?: string
  }
  documentTitle: string
  originalFilename: string
}

/** Embed the query and search for the most relevant chunks via the
 *  match_chunks Postgres RPC function.
 *  Returns chunks sorted by descending cosine similarity.
 */
export async function searchChunks(
  query: string,
  options: ChunkSearchOptions = {},
): Promise<RetrievedChunk[]> {
  const { topK = 8, threshold = 0.10, tags } = options

  const { embeddings, error } = await generateEmbeddings([query])
  if (error || embeddings.length === 0) {
    console.error('[retrieval] Failed to embed query:', error)
    return []
  }

  const queryEmbedding = embeddings[0]
  const supabase = await createClient()

  const { data, error: rpcError } = await supabase.rpc('match_chunks', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: threshold,
    match_count: topK,
    filter_tags: tags ?? null,
  })

  if (rpcError) {
    console.error('[retrieval] match_chunks RPC error:', rpcError.message)
    return []
  }

  return (data ?? []).map(row => ({
    id: row.id,
    documentId: row.document_id,
    chunkIndex: row.chunk_index,
    content: row.content,
    similarity: row.similarity,
    metadata: row.metadata as RetrievedChunk['metadata'],
    documentTitle: row.document_title,
    originalFilename: row.original_filename,
  }))
}
