'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/database.types'
import type { User, UserRole, UserStatus } from '@/lib/types'

/** Service-role client — bypasses RLS, gives access to auth.admin API. */
function serviceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

/** Fetches all platform users by joining auth.users (for email/dates) with profiles (for role/status/name). */
export async function getUsers(): Promise<User[]> {
  const supabase = serviceClient()

  // Fetch up to 1000 auth users and all profiles in parallel
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

/** Suspend or reactivate a user by updating their profile status. */
export async function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<{ error?: string }> {
  const supabase = serviceClient()
  const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return {}
}

/** Change a user's role. */
export async function updateUserRole(
  id: string,
  role: UserRole,
): Promise<{ error?: string }> {
  const supabase = serviceClient()
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/users')
  return {}
}
