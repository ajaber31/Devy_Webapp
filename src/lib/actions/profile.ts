'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateProfileSchema } from '@/lib/validation/schemas'
import type { Profile } from '@/lib/types'

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!data) {
    // Profile row missing — auto-create from user metadata (fallback if DB trigger didn't fire)
    const name =
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split('@')[0] ??
      'User'
    const role =
      (user.user_metadata?.role as string | undefined) ?? 'parent'

    const validRoles = ['parent', 'caregiver', 'clinician', 'teacher', 'admin'] as const
    type ValidRole = (typeof validRoles)[number]
    const safeRole: ValidRole = validRoles.includes(role as ValidRole) ? (role as ValidRole) : 'parent'

    const { data: created } = await supabase
      .from('profiles')
      .upsert({ id: user.id, name, role: safeRole, status: 'active' as const })
      .select('*')
      .single()

    if (!created) {
      return {
        id: user.id,
        name,
        email: user.email ?? '',
        role: safeRole,
        status: 'active',
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
        consentVersion: null,
        consentAcceptedAt: null,
      }
    }

    return {
      id: created.id,
      name: created.name,
      email: user.email ?? '',
      role: created.role,
      status: created.status,
      avatarUrl: created.avatar_url ?? undefined,
      createdAt: created.created_at,
      consentVersion: created.consent_version ?? null,
      consentAcceptedAt: created.consent_accepted_at ?? null,
    }
  }

  return {
    id: data.id,
    name: data.name,
    email: user.email ?? '',
    role: data.role,
    status: data.status,
    avatarUrl: data.avatar_url ?? undefined,
    createdAt: data.created_at,
    consentVersion: data.consent_version ?? null,
    consentAcceptedAt: data.consent_accepted_at ?? null,
  }
}

export async function updateProfile(updates: { name?: string }) {
  const parsed = updateProfileSchema.safeParse(updates)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)

  if (error) return { error: 'Failed to update profile' }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true }
}
