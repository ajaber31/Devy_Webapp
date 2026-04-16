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
import { chatRequestSchema } from '@/lib/validation/schemas'
import { checkRateLimit, CHAT_LIMIT } from '@/lib/rate-limit'
import { getPlanLimits } from '@/lib/stripe/plans'
import type { Child, Source } from '@/lib/types'
import type { Database } from '@/lib/supabase/database.types'

// Vercel Pro — up to 60s; ignored locally
export const maxDuration = 60

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

/**
 * Convert a natural-language question into a clean PubMed search query.
 * Strips conversational framing, possessives, child names.
 */
function toPubMedQuery(message: string, childName?: string): string {
  let q = message.toLowerCase()

  if (childName) q = q.replace(new RegExp(childName.toLowerCase(), 'g'), '')

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

  for (const pattern of framePatterns) q = q.replace(pattern, ' ')
  q = q.replace(/\s+/g, ' ').trim()

  if (q.length < 8) {
    q = childName
      ? message.replace(new RegExp(childName, 'gi'), '').replace(/\s+/g, ' ').trim()
      : message
  }

  return q
}

/**
 * Map a DB children row to the Child type.
 */
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

/**
 * Build and return an SSE streaming response.
 * Sends:
 *   { type: 'metadata', sources: Source[] }
 *   { type: 'token',    content: string }   (repeated)
 *   { type: 'done',     notFoundNote?: string }
 */
function streamSSE(
  completionParams: Parameters<OpenAI['chat']['completions']['create']>[0],
  sources: Source[],
): Response {
  const encoder = new TextEncoder()
  const openai = getOpenAI()

  const body = new ReadableStream({
    async start(controller) {
      const send = (obj: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      }

      // ── Send sources metadata upfront so the client can show the badge early ──
      send({ type: 'metadata', sources })

      try {
        const stream = await openai.chat.completions.create({
          ...completionParams,
          stream: true,
        })

        let fullContent = ''

        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content
          if (token) {
            fullContent += token
            send({ type: 'token', content: token })
          }
        }

        const notFoundNote =
          sources.length === 0 ? detectNotFoundNote(fullContent) : undefined

        send({ type: 'done', notFoundNote })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[/api/chat] OpenAI stream error:', msg)
        // Do not expose internal error details to the client.
        send({ type: 'error', message: 'An error occurred. Please try again.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

const HISTORY_LIMIT = 6 // last 3 exchanges

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
        setAll: () => {},
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Rate limiting ──────────────────────────────────────────────────────────
  const rl = await checkRateLimit(`chat:${user.id}`, CHAT_LIMIT)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before sending another message.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rl.resetAtMs - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(CHAT_LIMIT.maxRequests),
          'X-RateLimit-Remaining': '0',
        },
      },
    )
  }

  // ── Daily question limit ───────────────────────────────────────────────────
  {
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single()

    const planLimits = getPlanLimits(subData?.plan_id ?? 'free')

    if (planLimits.questionsPerDay !== Infinity) {
      const { data: usageCount } = await supabase.rpc('get_daily_usage', { p_user_id: user.id })
      const todayCount = (usageCount as number | null) ?? 0

      if (todayCount >= planLimits.questionsPerDay) {
        // Compute seconds until next UTC midnight for the Retry-After header
        const now = new Date()
        const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
        const retryAfterSecs = Math.ceil((midnight.getTime() - now.getTime()) / 1000)

        return NextResponse.json(
          {
            error: `You've used all ${planLimits.questionsPerDay} questions for today. Your limit resets at midnight UTC.`,
            code: 'DAILY_LIMIT_REACHED',
            limit: planLimits.questionsPerDay,
            current: todayCount,
            planId: subData?.plan_id ?? 'free',
          },
          {
            status: 429,
            headers: { 'Retry-After': String(retryAfterSecs) },
          },
        )
      }

      // Atomically increment before streaming — counts even if stream fails
      await supabase.rpc('increment_daily_usage', { p_user_id: user.id })
    }
  }

  // ── Parse + validate body ──────────────────────────────────────────────────
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = chatRequestSchema.safeParse(rawBody)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return NextResponse.json({ error: first?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { message, conversationId, childId, childName } = parsed.data

  // ── Read language preference ───────────────────────────────────────────────
  const lang = cookieStore.get('devy-lang')?.value === 'fr' ? 'fr' : 'en'

  // ── Fetch user role + child profile in parallel ────────────────────────────
  const [profileResult, childResult] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).single(),
    childId
      ? supabase
          .from('children')
          .select('*')
          .eq('id', childId)
          .eq('user_id', user.id)
          .single()
      : Promise.resolve({ data: null }),
  ])

  const userRole = profileResult.data?.role ?? undefined
  const child: Child | null = childResult.data
    ? toChild(childResult.data as Record<string, unknown>)
    : null

  // ── Load conversation history ──────────────────────────────────────────────
  let history: { role: 'user' | 'assistant'; content: string }[] = []

  if (conversationId) {
    // Verify the conversation belongs to this user before loading its messages.
    // RLS also enforces this, but we add an explicit ownership check here as
    // defence-in-depth so that a misconfigured RLS policy cannot leak history.
    const { data: convo } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (convo) {
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
  }

  // ── Short-circuit: purely conversational (greetings, thanks, etc.) ─────────
  if (isConversational(message)) {
    const conversationalPrompt = lang === 'fr'
      ? `${CONVERSATIONAL_SYSTEM_PROMPT}\n\nYou MUST respond in French (Français).`
      : CONVERSATIONAL_SYSTEM_PROMPT
    return streamSSE(
      {
        model: 'gpt-4o',
        temperature: 0.5,
        max_tokens: 150,
        messages: [
          { role: 'system', content: conversationalPrompt },
          ...history,
          { role: 'user', content: message },
        ],
      },
      [],
    )
  }

  // ── Build retrieval query — augment follow-ups with prior user message ─────
  let retrievalQuery = message
  if (isFollowUp(message) && history.length > 0) {
    const lastUserMsg = [...history].reverse().find(m => m.role === 'user')
    if (lastUserMsg) retrievalQuery = `${lastUserMsg.content} ${message}`
  }

  // ── Retrieval ──────────────────────────────────────────────────────────────
  const chunks = await searchChunks(retrievalQuery, { topK: 8 })

  // ── Build system prompt with full child profile + user role ───────────────
  const basePrompt = buildSystemPrompt(childName, child, userRole, lang)

  let fullSystem: string
  let sources: Source[] = []

  if (chunks.length > 0) {
    const contextBlock = buildContextBlock(chunks)
    fullSystem = `${basePrompt}\n\n## DOCUMENT CONTEXT\n\n${contextBlock}`
    sources = chunksToSources(chunks)
  } else {
    // No KB results — try PubMed
    const pubMedQuery = toPubMedQuery(retrievalQuery, child?.name ?? childName)
    const pubResult = await searchPubMed(pubMedQuery)

    if (pubResult.length > 0) {
      sources = pubMedSourcesToSources(pubResult)
      const pubContext = buildPubMedContextBlock(pubResult)
      fullSystem = `${basePrompt}\n\n${PUBMED_SYSTEM_PROMPT_SUFFIX}\n\n${pubContext}`
      // Fire-and-forget: persist to KB for future queries
      ingestPubMedSources(pubResult).catch(err => console.error('[pubmed-ingest]', err))
    } else {
      // Neither KB nor PubMed — Devy answers from trained knowledge
      fullSystem = basePrompt
    }
  }

  // Temperature: precise with sources, more natural without
  const temperature = sources.length > 0 ? 0.1 : 0.3

  return streamSSE(
    {
      model: 'gpt-4o',
      temperature,
      max_tokens: 1_000,
      messages: [
        { role: 'system', content: fullSystem },
        ...history,
        { role: 'user', content: message },
      ],
    },
    sources,
  )
}
