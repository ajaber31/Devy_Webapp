'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createChildSchema, updateChildSchema } from '@/lib/validation/schemas'
import { checkChildProfileLimit } from '@/lib/billing/enforcement'
import type { Child } from '@/lib/types'

function toChild(row: Record<string, unknown>): Child {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    dateOfBirth: (row.date_of_birth as string | null) ?? null,
    avatarColor: (row.avatar_color as 'sage' | 'dblue' | 'sand') ?? 'sage',
    contextLabels: (row.context_labels as string[]) ?? [],
    supportNeeds: (row.support_needs as string[]) ?? [],
    strengths: (row.strengths as string[]) ?? [],
    interests: (row.interests as string[]) ?? [],
    routines: (row.routines as string[]) ?? [],
    goals: (row.goals as string[]) ?? [],
    notes: (row.notes as string) ?? '',
    createdAt: row.created_at as string,
  }
}

export async function getChildrenCount(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('children')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return count ?? 0
}

export async function getChildren(): Promise<Child[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []).map(row => toChild(row as Record<string, unknown>))
}

export async function getChild(id: string): Promise<Child | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  return data ? toChild(data as Record<string, unknown>) : null
}

export async function createChild(input: {
  name: string
  dateOfBirth?: string | null
  avatarColor?: 'sage' | 'dblue' | 'sand'
  contextLabels?: string[]
  supportNeeds?: string[]
  strengths?: string[]
  interests?: string[]
  routines?: string[]
  goals?: string[]
  notes?: string
}): Promise<{ data?: Child; error?: string; code?: string; planId?: string }> {
  const parsed = createChildSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // ── Plan enforcement: check child profile limit ────────────────────────────
  const limitCheck = await checkChildProfileLimit(user.id)
  if (!limitCheck.allowed) {
    return {
      error: limitCheck.limit === 0
        ? 'Child profiles require a paid plan. Upgrade to Standard or Professional to get started.'
        : `You've reached the ${limitCheck.limit}-profile limit on your current plan. Upgrade to add more.`,
      code: 'PROFILE_LIMIT_REACHED',
      planId: limitCheck.planId,
    }
  }

  const v = parsed.data
  const { data, error } = await supabase
    .from('children')
    .insert({
      user_id: user.id,
      name: v.name,
      date_of_birth: v.dateOfBirth ?? null,
      avatar_color: v.avatarColor ?? 'sage',
      context_labels: v.contextLabels ?? [],
      support_needs: v.supportNeeds ?? [],
      strengths: v.strengths ?? [],
      interests: v.interests ?? [],
      routines: v.routines ?? [],
      goals: v.goals ?? [],
      notes: v.notes ?? '',
    })
    .select()
    .single()

  if (error) return { error: 'Failed to create profile' }

  revalidatePath('/children')
  return { data: toChild(data as Record<string, unknown>) }
}

export async function updateChild(
  id: string,
  updates: Partial<{
    name: string
    dateOfBirth: string | null
    avatarColor: 'sage' | 'dblue' | 'sand'
    contextLabels: string[]
    supportNeeds: string[]
    strengths: string[]
    interests: string[]
    routines: string[]
    goals: string[]
    notes: string
  }>
): Promise<{ data?: Child; error?: string }> {
  const parsed = updateChildSchema.safeParse(updates)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const v = parsed.data
  const dbUpdates: Record<string, unknown> = {}
  if (v.name !== undefined)          dbUpdates.name = v.name
  if (v.dateOfBirth !== undefined)   dbUpdates.date_of_birth = v.dateOfBirth
  if (v.avatarColor !== undefined)   dbUpdates.avatar_color = v.avatarColor
  if (v.contextLabels !== undefined) dbUpdates.context_labels = v.contextLabels
  if (v.supportNeeds !== undefined)  dbUpdates.support_needs = v.supportNeeds
  if (v.strengths !== undefined)     dbUpdates.strengths = v.strengths
  if (v.interests !== undefined)     dbUpdates.interests = v.interests
  if (v.routines !== undefined)      dbUpdates.routines = v.routines
  if (v.goals !== undefined)         dbUpdates.goals = v.goals
  if (v.notes !== undefined)         dbUpdates.notes = v.notes

  const { data, error } = await supabase
    .from('children')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', user.id) // ownership enforcement — defense in depth beyond RLS
    .select()
    .single()

  if (error) return { error: 'Failed to update profile' }

  revalidatePath('/children')
  revalidatePath(`/children/${id}`)
  return { data: toChild(data as Record<string, unknown>) }
}

export async function deleteChild(id: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // ownership enforcement — defense in depth beyond RLS

  if (error) return { error: 'Failed to delete profile' }
  revalidatePath('/children')
  return {}
}
