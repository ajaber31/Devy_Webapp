'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { deleteDocumentFile } from '@/lib/supabase/storage'
import { createDocumentSchema, updateDocumentTagsSchema } from '@/lib/validation/schemas'
import type { Document, DocumentStatus } from '@/lib/types'

/**
 * Verifies the caller is an authenticated admin.
 * Returns an error string if not authorized, null if OK.
 * All document write/delete actions must call this — defence-in-depth beyond RLS.
 */
async function requireAdmin(): Promise<{ error: string } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') return { error: 'Forbidden' }
  return null
}

function mapRow(row: {
  id: string
  title: string
  original_filename: string
  file_type: 'pdf' | 'docx' | 'txt'
  file_size_bytes: number | null
  storage_path: string
  status: string
  uploaded_by: string | null
  uploaded_at: string
  processed_at: string | null
  tags: string[]
  chunk_count: number
  error_message: string | null
}): Document {
  return {
    id: row.id,
    title: row.title,
    originalFilename: row.original_filename,
    type: row.file_type,
    fileSizeBytes: row.file_size_bytes ?? 0,
    storagePath: row.storage_path,
    status: row.status as DocumentStatus,
    uploadedBy: row.uploaded_by,
    uploadedAt: row.uploaded_at,
    processedAt: row.processed_at,
    tags: row.tags,
    chunkCount: row.chunk_count,
    errorMessage: row.error_message,
  }
}

/** Returns all documents ordered by upload date descending.
 *  RLS enforces admin-only access at the database level.
 */
export async function getDocuments(): Promise<Document[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('[documents] getDocuments error:', error.message)
    return []
  }

  return (data ?? []).map(mapRow)
}

/** Returns the count of documents with status='ready' — usable by all authenticated users. */
export async function getReadyDocumentCount(): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'ready')
  return count ?? 0
}

/** Creates a document metadata record after the file is already in Storage.
 *  Does NOT trigger processing — the caller is responsible for that.
 */
export async function createDocumentRecord(input: {
  title: string
  originalFilename: string
  fileType: 'pdf' | 'docx' | 'txt'
  storagePath: string
  fileSizeBytes: number
  tags?: string[]
}): Promise<{ data?: Document; error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const parsed = createDocumentSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: first?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const v = parsed.data
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: v.title,
      original_filename: v.originalFilename,
      file_type: v.fileType,
      storage_path: v.storagePath,
      file_size_bytes: v.fileSizeBytes,
      uploaded_by: user.id,
      tags: v.tags ?? [],
      status: 'uploaded',
    })
    .select()
    .single()

  if (error) return { error: 'Failed to create document record' }

  revalidatePath('/admin/documents')
  return { data: mapRow(data) }
}

/** Deletes a document record and its associated storage file.
 *  Chunks are deleted automatically via ON DELETE CASCADE.
 */
export async function deleteDocument(id: string): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()

  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchError) return { error: 'Document not found' }

  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (deleteError) return { error: 'Failed to delete document' }

  if (doc?.storage_path) {
    await deleteDocumentFile(doc.storage_path)
  }

  revalidatePath('/admin/documents')
  return {}
}

/** Resets a document back to 'uploaded' status so it can be re-processed. */
export async function reprocessDocument(id: string): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()

  await supabase.from('document_chunks').delete().eq('document_id', id)

  const { error } = await supabase
    .from('documents')
    .update({
      status: 'uploaded',
      error_message: null,
      chunk_count: 0,
      processed_at: null,
    })
    .eq('id', id)

  if (error) return { error: 'Failed to reset document' }

  revalidatePath('/admin/documents')
  return {}
}

/** Updates the tags array for a document. */
export async function updateDocumentTags(
  id: string,
  tags: string[],
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const parsed = updateDocumentTagsSchema.safeParse({ id, tags })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('documents')
    .update({ tags: parsed.data.tags })
    .eq('id', parsed.data.id)

  if (error) return { error: 'Failed to update tags' }

  revalidatePath('/admin/documents')
  return {}
}

/** Fetches the current processing status of a single document. */
export async function getDocumentStatus(id: string): Promise<DocumentStatus | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('status')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data.status as DocumentStatus
}
