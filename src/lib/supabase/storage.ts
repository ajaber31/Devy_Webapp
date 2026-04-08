import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const BUCKET = 'documents'

/** Service-role client for server-only operations (signed URLs, deletion).
 *  Never import this in client components.
 */
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(url, key, { auth: { persistSession: false } })
}

/** Generate a short-lived signed URL for server-side processing.
 *  Server-only — uses service role key.
 */
export async function getDocumentSignedUrl(
  storagePath: string,
  expiresIn = 300,
): Promise<{ url: string; error?: string }> {
  const supabase = serviceClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error || !data?.signedUrl) {
    return { url: '', error: error?.message ?? 'Failed to create signed URL' }
  }
  return { url: data.signedUrl }
}

/** Delete a file from storage. Server-only — uses service role key. */
export async function deleteDocumentFile(
  storagePath: string,
): Promise<{ error?: string }> {
  const supabase = serviceClient()
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (error) return { error: error.message }
  return {}
}
