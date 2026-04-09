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
  CONVERSATIONAL_SYSTEM_PROMPT,
  PUBMED_SYSTEM_PROMPT_SUFFIX,
  isConversational,
  isFollowUp,
} from '@/lib/ai/prompt-builder'
import { searchPubMed, buildPubMedContextBlock, pubMedSourcesToSources } from '@/lib/ai/pubmed'
import { ingestPubMedSources } from '@/lib/ai/pubmed-ingest'
import type { Source } from '@/lib/types'
import type { Database } from '@/lib/supabase/database.types'

// Vercel Pro — up to 60s; ignored locally
export const maxDuration = 60

// ─── PubMed Query Helper ──────────────────────────────────────────────────────

/**
 * Convert a natural-language user question into a clean PubMed search query.
 *
 * Strips:
 * - Conversational framing ("how do I know if", "can you tell me about", etc.)
 * - Child names
 * - Possessives and personal references ("my son", "her daughter", etc.)
 *
 * Example: "how do i know if my son has autism" → "autism diagnosis children"
 */
function toPubMedQuery(message: string, childName?: string): string {
  let q = message.toLowerCase()

  // Strip child name
  if (childName) {
    q = q.replace(new RegExp(childName.toLowerCase(), 'g'), '')
  }

  // Strip conversational framing patterns
  const framePatterns = [
    /^(can you (tell me|explain|describe|help me understand)|please (explain|describe|tell me))\s+/,
    /^(how do i (know|find out|tell|figure out|check|identify|recognize) (if|whether|when|that))\s+/,
    /^(what (are|is) (the )?(signs?|symptoms?|indicators?|ways?|best ways?) (of|for|to))\s+/,
    /^(what should i (do|know|look for|watch for|expect))\s+/,
    /^(i('m| am) (worried|concerned|unsure|not sure|wondering) (about|if|whether))\s+/,
    /^(is (it|there) (possible|normal|common|typical|okay|ok) (that|for|to))\s+/,
    /^(does (my|our|the|a))?\s*/,
    /^(help me (with|understand|find))\s+/,
    /\b(my|our|his|her|their)\s+(son|daughter|child|kid|boy|girl|student|client|patient)\b/g,
    /\b(he|she|they)\s+(has|have|might have|could have|may have)\b/g,
  ]

  for (const pattern of framePatterns) {
    q = q.replace(pattern, ' ')
  }

  // Compress whitespace
  q = q.replace(/\s+/g, ' ').trim()

  // If stripping left something too short or empty, fall back to original minus child name
  if (q.length < 8) {
    q = childName
      ? message.replace(new RegExp(childName, 'gi'), '').replace(/\s+/g, ' ').trim()
      : message
  }

  return q
}

const HISTORY_LIMIT = 6   // last 3 exchanges for context

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

  // ── Short-circuit: purely conversational (greetings, thanks, etc.) ─────────
  if (isConversational(message)) {
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.5,
        max_tokens: 150,
        messages: [
          { role: 'system', content: CONVERSATIONAL_SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: message },
        ],
      })
      const content = completion.choices[0]?.message?.content?.trim() ?? "Hi! How can I help you today?"
      return NextResponse.json({ content, sources: [] })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[/api/chat] OpenAI error (conversational):', msg)
      return NextResponse.json({ error: `AI generation failed: ${msg}` }, { status: 500 })
    }
  }

  // ── Build retrieval query — augment follow-ups with prior user message ─────
  // "Can you elaborate?" alone embeds poorly; combining with the original
  // question retrieves the right KB documents so follow-ups stay grounded.
  let retrievalQuery = message
  if (isFollowUp(message) && history.length > 0) {
    const lastUserMsg = [...history].reverse().find(m => m.role === 'user')
    if (lastUserMsg) {
      retrievalQuery = `${lastUserMsg.content} ${message}`
    }
  }

  // ── Retrieval — search all docs (peer-reviewed docs get higher natural similarity) ──
  const chunks = await searchChunks(retrievalQuery, { topK: 8 })

  // ── Build prompt + context ─────────────────────────────────────────────────
  // Strategy: enrich the base prompt with the best available research context.
  // When no context is found, Devy still answers from its training — it never refuses.
  let pubMedSources: Source[] = []
  const basePrompt = buildSystemPrompt(childName)

  let fullSystem: string

  if (chunks.length > 0) {
    // KB has relevant chunks — use them as primary context
    const contextBlock = buildContextBlock(chunks)
    fullSystem = `${basePrompt}\n\n## DOCUMENT CONTEXT\n\n${contextBlock}`
  } else {
    // No KB results — try PubMed to enrich the answer with current research
    const pubMedQuery = toPubMedQuery(retrievalQuery, childName)
    const pubResult = await searchPubMed(pubMedQuery)

    if (pubResult.length > 0) {
      pubMedSources = pubMedSourcesToSources(pubResult)
      const pubContext = buildPubMedContextBlock(pubResult)
      fullSystem = `${basePrompt}\n\n${PUBMED_SYSTEM_PROMPT_SUFFIX}\n\n${pubContext}`
      // Fire-and-forget: persist to KB so future similar queries hit the DB
      ingestPubMedSources(pubResult).catch(err => console.error('[pubmed-ingest]', err))
    } else {
      // Neither KB nor PubMed found anything — Devy answers from its trained knowledge
      fullSystem = basePrompt
    }
  }

  const sources = chunks.length > 0 ? chunksToSources(chunks) : pubMedSources

  // ── Call OpenAI ────────────────────────────────────────────────────────────
  // Use slightly higher temperature when no specific research context is available
  // so general answers feel natural rather than terse.
  const temperature = sources.length > 0 ? 0.1 : 0.3

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      temperature,
      max_tokens: 1_000,
      messages: [
        { role: 'system', content: fullSystem },
        ...history,
        { role: 'user', content: message },
      ],
    })

    const content = completion.choices[0]?.message?.content?.trim()
      ?? "I'm sorry, I wasn't able to generate a response. Please try again."

    const notFoundNote = sources.length === 0 ? detectNotFoundNote(content) : undefined

    return NextResponse.json({ content, sources, notFoundNote })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/chat] OpenAI error:', msg)
    return NextResponse.json({ error: `AI generation failed: ${msg}` }, { status: 500 })
  }
}
