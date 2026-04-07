'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
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
  dateOfBirth?: string
  avatarColor?: 'sage' | 'dblue' | 'sand'
  contextLabels?: string[]
  supportNeeds?: string[]
  strengths?: string[]
  interests?: string[]
  routines?: string[]
  goals?: string[]
  notes?: string
}): Promise<{ data?: Child; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('children')
    .insert({
      user_id: user.id,
      name: input.name,
      date_of_birth: input.dateOfBirth ?? null,
      avatar_color: input.avatarColor ?? 'sage',
      context_labels: input.contextLabels ?? [],
      support_needs: input.supportNeeds ?? [],
      strengths: input.strengths ?? [],
      interests: input.interests ?? [],
      routines: input.routines ?? [],
      goals: input.goals ?? [],
      notes: input.notes ?? '',
    })
    .select()
    .single()

  if (error) return { error: error.message }

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
  const supabase = createClient()

  const dbUpdates: Record<string, unknown> = {}
  if (updates.name !== undefined)          dbUpdates.name = updates.name
  if (updates.dateOfBirth !== undefined)   dbUpdates.date_of_birth = updates.dateOfBirth
  if (updates.avatarColor !== undefined)   dbUpdates.avatar_color = updates.avatarColor
  if (updates.contextLabels !== undefined) dbUpdates.context_labels = updates.contextLabels
  if (updates.supportNeeds !== undefined)  dbUpdates.support_needs = updates.supportNeeds
  if (updates.strengths !== undefined)     dbUpdates.strengths = updates.strengths
  if (updates.interests !== undefined)     dbUpdates.interests = updates.interests
  if (updates.routines !== undefined)      dbUpdates.routines = updates.routines
  if (updates.goals !== undefined)         dbUpdates.goals = updates.goals
  if (updates.notes !== undefined)         dbUpdates.notes = updates.notes

  const { data, error } = await supabase
    .from('children')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/children')
  revalidatePath(`/children/${id}`)
  return { data: toChild(data as Record<string, unknown>) }
}

export async function deleteChild(id: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { error } = await supabase.from('children').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/children')
  return {}
}
