'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database, Json } from '@/lib/supabase/database.types'

function serviceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

/** Write an immutable entry to the privacy_audit_log. */
type AuditEventType = 'consent_accepted' | 'consent_version_bump' | 'data_export_requested' | 'data_deletion_requested' | 'account_deleted'

async function writeAuditLog(
  userId: string,
  eventType: AuditEventType,
  eventData: Record<string, unknown> = {},
) {
  const db = serviceClient()
  await db.from('privacy_audit_log').insert({
    user_id: userId,
    event_type: eventType,
    event_data: eventData as Json,
  })
}

/** Returns the user's audit log entries (most recent first, capped at 50). */
export async function getPrivacyAuditLog(): Promise<
  Array<{ id: string; event_type: string; event_data: Record<string, unknown>; created_at: string }>
> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('privacy_audit_log')
    .select('id, event_type, event_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (data ?? []) as Array<{
    id: string
    event_type: string
    event_data: Record<string, unknown>
    created_at: string
  }>
}

/**
 * Records a data export request and returns a JSON blob of the user's data.
 * The export includes profile, children, conversations, and message previews.
 * Full message content is included — this is the user's own data.
 */
export async function requestDataExport(): Promise<{ data?: string; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const [profileRes, childrenRes, conversationsRes, messagesRes] = await Promise.all([
    supabase.from('profiles').select('id, name, role, status, created_at, consent_version, consent_accepted_at').eq('id', user.id).single(),
    supabase.from('children').select('*').eq('user_id', user.id),
    supabase.from('conversations').select('id, title, preview, created_at, updated_at, child_id').eq('user_id', user.id),
    supabase.from('messages').select('id, conversation_id, role, content, created_at').limit(500),
  ])

  const exportPayload = {
    exported_at: new Date().toISOString(),
    export_version: '1.0',
    account: {
      email: user.email,
      ...((profileRes.data as Record<string, unknown>) ?? {}),
    },
    children: childrenRes.data ?? [],
    conversations: conversationsRes.data ?? [],
    messages: messagesRes.data ?? [],
  }

  await writeAuditLog(user.id, 'data_export_requested', {
    exported_at: exportPayload.exported_at,
    record_counts: {
      children: childrenRes.data?.length ?? 0,
      conversations: conversationsRes.data?.length ?? 0,
      messages: messagesRes.data?.length ?? 0,
    },
  })

  return { data: JSON.stringify(exportPayload, null, 2) }
}

/**
 * Permanently deletes the user's account and all associated personal data.
 * The privacy_audit_log entry is written before deletion so the record survives.
 * This action is irreversible.
 */
export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const db = serviceClient()

  // 1. Write audit log BEFORE deletion (log survives with user_id set to NULL by ON DELETE SET NULL)
  await writeAuditLog(user.id, 'account_deleted', {
    deleted_at: new Date().toISOString(),
    email_hash: Buffer.from(user.email ?? '').toString('base64'),
  })

  // 2. Delete children, conversations, messages via RLS cascade — user deletes their own
  await Promise.all([
    supabase.from('conversations').delete().eq('user_id', user.id),
    supabase.from('children').delete().eq('user_id', user.id),
  ])

  // 3. Delete the profile row
  await db.from('profiles').delete().eq('id', user.id)

  // 4. Delete from auth.users via admin API — this is the final, irreversible step
  const { error } = await db.auth.admin.deleteUser(user.id)
  if (error) return { error: 'Account deletion failed. Please contact privacy@devy.ca.' }

  // 5. Sign out and redirect
  await supabase.auth.signOut()
  redirect('/login?deleted=1')
}

/**
 * Records a formal data deletion request (for users who want to request via email
 * rather than self-serve deletion). Does NOT delete data immediately.
 */
export async function requestDataDeletion(): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  await writeAuditLog(user.id, 'data_deletion_requested', {
    requested_at: new Date().toISOString(),
    method: 'manual_request',
  })

  return {}
}
