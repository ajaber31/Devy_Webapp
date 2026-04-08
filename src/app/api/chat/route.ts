import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import OpenAI from 'openai'
import { searchChunks } from '@/lib/document-processing/retrieval'
import {
  buildSystemPrompt,
  buildContextBlock,
  chunksToSources,
  detectNotFoundNote,
  FALLBACK_SYSTEM_PROMPT,
} from '@/lib/ai/prompt-builder'
import type { Database } from '@/lib/supabase/database.types'

// Vercel Pro — up to 60s; ignored locally
export const maxDuration = 60

const HISTORY_LIMIT = 6       // last 3 exchanges for context
const PEER_REVIEWED_MIN = 2   // fall back to all docs if fewer peer-reviewed results

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Auth ───────────────────────────────────────────────────────────────────
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // read-only in route handlers
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body: {
    message: string
    conversationId: string | null
    childId?: string
    childName?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { message, conversationId, childName } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // ── Load conversation history ──────────────────────────────────────────────
  let history: { role: 'user' | 'assistant'; content: string }[] = []

  if (conversationId) {
    const { data } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(HISTORY_LIMIT)

    if (data) {
      history = data
        .reverse()
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    }
  }

  // ── Retrieval — peer-reviewed first, then all docs ─────────────────────────
  let chunks = await searchChunks(message, { topK: 8, tags: ['peer-reviewed'] })

  if (chunks.length < PEER_REVIEWED_MIN) {
    chunks = await searchChunks(message, { topK: 8 })
  }

  // ── Build prompt + context ─────────────────────────────────────────────────
  const hasChunks = chunks.length > 0
  const sources = hasChunks ? chunksToSources(chunks) : []

  let fullSystem: string
  if (hasChunks) {
    const contextBlock = buildContextBlock(chunks)
    fullSystem = `${buildSystemPrompt(childName)}\n\n## DOCUMENT CONTEXT\n\n${contextBlock}`
  } else {
    // No KB results — use conversational fallback (allows greetings + general Qs)
    fullSystem = FALLBACK_SYSTEM_PROMPT
  }

  // ── Call OpenAI ────────────────────────────────────────────────────────────
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,   // low temperature for factual, grounded responses
      max_tokens: 1_000,
      messages: [
        { role: 'system', content: fullSystem },
        ...history,
        { role: 'user', content: message },
      ],
    })

    const content =
      completion.choices[0]?.message?.content?.trim() ?? noKbResponse.content

    // Only surface a notFoundNote when no sources were retrieved — showing
    // a "not enough info" disclaimer alongside source cards is contradictory.
    const notFoundNote = sources.length === 0 ? detectNotFoundNote(content) : undefined

    return NextResponse.json({ content, sources, notFoundNote })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/chat] OpenAI error:', msg)
    return NextResponse.json({ error: `AI generation failed: ${msg}` }, { status: 500 })
  }
}
