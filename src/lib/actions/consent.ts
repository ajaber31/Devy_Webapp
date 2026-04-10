'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { CURRENT_CONSENT_VERSION } from '@/lib/types'
import type { Database } from '@/lib/supabase/database.types'

function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

/**
 * Records the user's explicit consent to the current privacy policy.
 * Writes both the profiles row and an immutable privacy_audit_log entry.
 */
export async function recordConsent(): Promise<{ error?: string }> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const now = new Date().toISOString()
  const db = serviceClient()

  // 1. Stamp the profile
  const { error: profileErr } = await db
    .from('profiles')
    .update({
      consent_version: CURRENT_CONSENT_VERSION,
      consent_accepted_at: now,
    })
    .eq('id', user.id)

  if (profileErr) return { error: 'Failed to record consent' }

  // 2. Write immutable audit log entry
  await db.from('privacy_audit_log').insert({
    user_id: user.id,
    event_type: 'consent_accepted',
    event_data: {
      consent_version: CURRENT_CONSENT_VERSION,
      accepted_at: now,
    },
  })

  return {}
}

/**
 * Returns true if the current user has consented to the current policy version.
 * Used by the dashboard layout to decide whether to redirect to /consent.
 */
export async function hasValidConsent(): Promise<boolean> {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('profiles')
    .select('consent_version, consent_accepted_at')
    .eq('id', user.id)
    .single()

  if (!data) return false
  return data.consent_version === CURRENT_CONSENT_VERSION && data.consent_accepted_at != null
}
