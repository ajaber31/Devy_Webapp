'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateUserRoleSchema, updateUserStatusSchema } from '@/lib/validation/schemas'
import type { Database } from '@/lib/supabase/database.types'
import type { User, UserRole, UserStatus } from '@/lib/types'

// ─── Authorization guard ──────────────────────────────────────────────────────

/**
 * Verifies the current session user is an admin.
 * Must be called at the start of every admin server action.
 * Returns an error string if not authorized, null if OK.
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

// ─── Service client (bypasses RLS) ───────────────────────────────────────────

/** Only used after requireAdmin() confirms the caller is an admin. */
function serviceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/** Fetches all platform users. Admin-only. */
export async function getUsers(): Promise<User[]> {
  const authErr = await requireAdmin()
  if (authErr) return []

  const supabase = serviceClient()

  const [authResult, profilesResult] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from('profiles').select('id, name, role, status'),
  ])

  const authUsers = authResult.data?.users ?? []
  const profiles = profilesResult.data ?? []
  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

  return authUsers.map(au => {
    const p = profileMap[au.id]
    return {
      id: au.id,
      name: p?.name ?? (au.user_metadata?.name as string | undefined) ?? 'Unknown',
      email: au.email ?? '',
      role: ((p?.role ?? 'parent') as UserRole),
      status: ((p?.status ?? 'active') as UserStatus),
      joinedAt: au.created_at,
      lastActiveAt: au.last_sign_in_at ?? au.created_at,
    }
  })
}

/** Suspend or reactivate a user. Admin-only. */
export async function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const parsed = updateUserStatusSchema.safeParse({ id, status })
  if (!parsed.success) return { error: 'Invalid input' }

  const supabase = serviceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)

  if (error) return { error: 'Update failed' }
  revalidatePath('/admin/users')
  return {}
}

/** Change a user's role. Admin-only. */
export async function updateUserRole(
  id: string,
  role: UserRole,
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const parsed = updateUserRoleSchema.safeParse({ id, role })
  if (!parsed.success) return { error: 'Invalid input' }

  const supabase = serviceClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.id)

  if (error) return { error: 'Update failed' }
  revalidatePath('/admin/users')
  return {}
}
