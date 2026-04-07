'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Conversation, Message, Source } from '@/lib/types'
import type { Json } from '@/lib/supabase/database.types'

export async function getConversations(): Promise<Conversation[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('conversations')
    .select('*, messages(count)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (!data) return []

  return data.map(row => ({
    id: row.id,
    title: row.title,
    preview: row.preview,
    updatedAt: row.updated_at,
    // Supabase returns count as [{count: N}]
    messageCount: Array.isArray(row.messages) ? (row.messages[0] as { count: number } | undefined)?.count ?? 0 : 0,
    isPinned: row.is_pinned,
    tags: row.tags ?? [],
    childId: row.child_id ?? undefined,
  }))
}

export async function getConversationsForChild(childId: string): Promise<Conversation[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('conversations')
    .select('*, messages(count)')
    .eq('user_id', user.id)
    .eq('child_id', childId)
    .order('updated_at', { ascending: false })

  if (!data) return []

  return data.map(row => ({
    id: row.id,
    title: row.title,
    preview: row.preview,
    updatedAt: row.updated_at,
    messageCount: Array.isArray(row.messages) ? (row.messages[0] as { count: number } | undefined)?.count ?? 0 : 0,
    isPinned: row.is_pinned,
    tags: row.tags ?? [],
    childId: row.child_id ?? undefined,
  }))
}

export async function getUserMessageCount(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  // RLS ensures only messages in user-owned conversations are returned
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')

  return count ?? 0
}

export async function getConversationCount(): Promise<number> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return count ?? 0
}

export async function createConversation(input: {
  title?: string
  childId?: string
}): Promise<{ data?: Conversation; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      title: input.title ?? 'New conversation',
      child_id: input.childId ?? null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/chat')
  revalidatePath('/dashboard')

  return {
    data: {
      id: data.id,
      title: data.title,
      preview: data.preview,
      updatedAt: data.updated_at,
      messageCount: 0,
      isPinned: data.is_pinned,
      tags: data.tags ?? [],
      childId: data.child_id ?? undefined,
    },
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (!data) return []

  return data.map(row => ({
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    createdAt: row.created_at,
    sources: row.sources as unknown as Source[] | undefined,
    notFoundNote: row.not_found_note ?? undefined,
  }))
}

export async function insertMessage(input: {
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  notFoundNote?: string
}): Promise<{ data?: Message; error?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      role: input.role,
      content: input.content,
      sources: input.sources ? (input.sources as unknown as Json) : null,
      not_found_note: input.notFoundNote ?? null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Update conversation preview + updated_at
  await supabase
    .from('conversations')
    .update({
      preview: input.content.slice(0, 120),
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.conversationId)

  return {
    data: {
      id: data.id,
      conversationId: data.conversation_id,
      role: data.role as 'user' | 'assistant',
      content: data.content,
      createdAt: data.created_at,
    },
  }
}

export async function updateConversationTitle(id: string, title: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/chat')
  return { success: true }
}
