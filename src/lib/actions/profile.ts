'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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

    // Even if DB upsert failed, return a minimal in-memory profile so the
    // layout does not redirect to /login while the user IS authenticated.
    // This prevents the middleware ↔ layout redirect loop.
    const fallbackName = name
    const fallbackRole = safeRole

    if (!created) {
      return {
        id: user.id,
        name: fallbackName,
        email: user.email ?? '',
        role: fallbackRole,
        status: 'active',
        avatarUrl: undefined,
        createdAt: new Date().toISOString(),
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
  }
}

export async function updateProfile(updates: { name?: string }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true }
}
