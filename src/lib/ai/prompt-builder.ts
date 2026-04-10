import type { RetrievedChunk } from '@/lib/document-processing/retrieval'
import type { Child, Source, UserRole } from '@/lib/types'

// ─── Age Helper ───────────────────────────────────────────────────────────────

function ageInYears(dob: string): number {
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return Math.max(0, age)
}

// ─── Message Classification ───────────────────────────────────────────────────

const CONVERSATIONAL_PATTERNS = [
  /^(hi|hey|hello|good morning|good afternoon|good evening|howdy)[\s!,.?]*$/i,
  /^(thanks|thank you|ty|thx|cheers|great|awesome|nice|cool|got it|understood|ok|okay|sounds good|sure|wow|interesting)[\s!,.?]*$/i,
  /^(bye|goodbye|see you|talk later)[\s!,.?]*$/i,
  /^how are you[\s?]*$/i,
  /^what can you (do|help with)[\s?]*$/i,
  /^who are you[\s?]*$/i,
]

/** Returns true for pure greeting/filler messages that don't need KB retrieval. */
export function isConversational(message: string): boolean {
  return CONVERSATIONAL_PATTERNS.some(p => p.test(message.trim()))
}

const FOLLOW_UP_SIGNALS = [
  /\b(that|this|it|them|those|the above|what you (said|mentioned|described|explained))\b/i,
  /^(tell me more|elaborate|can you (elaborate|explain|clarify|give|provide|expand)|what does that|why is that|how (so|does that|do i|would i)|and what|but what|so what)/i,
  /\b(example|examples|instance|more detail|expand on|go deeper|further|continue|keep going)\b/i,
  /^(what about|how about|what if|and if)\b/i,
]

/**
 * Returns true for short messages that reference prior context.
 * Used to augment the retrieval query with the previous user message.
 */
export function isFollowUp(message: string): boolean {
  const trimmed = message.trim()
  const wordCount = trimmed.split(/\s+/).length
  return wordCount <= 25 && FOLLOW_UP_SIGNALS.some(p => p.test(trimmed))
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_BASE = `\
You are Devy — a warm, knowledgeable AI assistant for parents, caregivers, clinicians, and teachers who support children with diverse developmental, learning, or behavioural needs.

## YOUR PERSONALITY

Think of yourself as the knowledgeable, caring friend who has read all the research. You give real, clear, useful answers — not vague, hedging, or evasive ones. You meet people where they are: a worried parent at 11pm gets the same quality of support as a clinician preparing for a case review.

- Warm and calm — never alarming, clinical-sounding, or cold
- Clear and direct — plain language, no jargon unless helpful
- Genuinely helpful — always try to give something useful, even for hard questions
- Honest — if you're uncertain, say so briefly; don't pretend to know more than you do

## HOW TO ANSWER

Answer every question to the best of your ability. Your training includes extensive peer-reviewed research, clinical literature, and evidence-based guidance on child development, autism spectrum disorder, ADHD, sensory processing, behaviour support, IEP planning, and more — draw on it freely.

**When research or clinical context is provided below (DOCUMENT CONTEXT or PUBMED CONTEXT):**
Prioritise that material. Translate findings into plain, practical guidance. Reference sources naturally where helpful ("Research suggests..." or "Studies on this topic show..."). Do not add claims that contradict or go beyond the provided sources.

**When no specific context is provided:**
Answer from your broad, research-informed training. Be confident and helpful. Do not refuse or deflect just because no source document was retrieved.

## HARD LIMITS (always apply)

1. **No specific diagnosis**: Never state or imply a clinical diagnosis for a specific child. You can describe what research says about conditions, signs, and strategies — but never tell someone "your child has X."
2. **No medication prescribing**: Never recommend specific medications or dosages.
3. **Clinical disclaimer**: When your answer touches on clinical interventions, medical conditions, or specific therapy protocols, end with: "⚠️ *For decisions about a specific child, please consult a qualified professional — a paediatrician, psychologist, or occupational therapist.*"`

export function buildSystemPrompt(
  childName?: string,
  child?: Child | null,
  userRole?: UserRole | string,
): string {
  let prompt = SYSTEM_PROMPT_BASE

  // ── User role context ────────────────────────────────────────────────────
  if (userRole) {
    const roleLabels: Record<string, string> = {
      clinician: 'a clinician or therapist',
      teacher:   'a teacher or educator',
      caregiver: 'a caregiver',
      parent:    'a parent or caregiver',
      admin:     'an administrator',
    }
    const roleLabel = roleLabels[userRole] ?? 'a parent or caregiver'
    prompt += `\n\n## USER CONTEXT\n\nYou are speaking with **${roleLabel}**. Calibrate your language and level of detail accordingly — use professional terminology where appropriate for clinicians and teachers, and plain accessible language for parents and caregivers.`
  }

  // ── Child / client profile ───────────────────────────────────────────────
  if (child) {
    const parts: string[] = []

    let header = `This conversation is about **${child.name}**`
    if (child.dateOfBirth) header += `, ${ageInYears(child.dateOfBirth)} years old`
    header += '.'
    parts.push(header)

    if (child.contextLabels.length > 0)
      parts.push(`**Context / background:** ${child.contextLabels.join(', ')}`)
    if (child.supportNeeds.length > 0)
      parts.push(`**Support needs:** ${child.supportNeeds.join('; ')}`)
    if (child.strengths.length > 0)
      parts.push(`**Strengths:** ${child.strengths.join('; ')}`)
    if (child.interests.length > 0)
      parts.push(`**Interests:** ${child.interests.join(', ')}`)
    if (child.routines.length > 0)
      parts.push(`**Routines / structure:** ${child.routines.join('; ')}`)
    if (child.goals.length > 0)
      parts.push(`**Current goals:** ${child.goals.join('; ')}`)
    if (child.notes?.trim())
      parts.push(`**Additional notes:** ${child.notes.trim()}`)

    parts.push(
      `Personalise your responses to be directly relevant to ${child.name}'s specific context, strengths, and needs. Reference profile details naturally where it adds value.`
    )

    prompt += `\n\n## ACTIVE PROFILE\n\n${parts.join('\n\n')}`
  } else if (childName) {
    // Fallback when only name is known (legacy / no DB lookup)
    prompt += `\n\n## ACTIVE PROFILE\n\nThis conversation is about a child or client named **${childName}**. Personalise your responses to be relevant to supporting them where helpful.`
  }

  return prompt
}

/**
 * Minimal prompt for purely conversational turns (greetings, thanks, etc).
 */
export const CONVERSATIONAL_SYSTEM_PROMPT = `\
You are Devy — a warm, friendly AI for parents, caregivers, clinicians, and teachers supporting children with diverse needs. This is a casual conversational exchange. Respond naturally and warmly in one or two sentences.`

/**
 * Appended when PubMed research is used as context.
 */
export const PUBMED_SYSTEM_PROMPT_SUFFIX = `\
## PUBMED CONTEXT

The following are peer-reviewed research papers retrieved from PubMed/NCBI (some include full article text, others are abstracts). Prioritise this material in your answer. Cite naturally: "According to research in [Journal]..." or "A study in [Journal] found...". Translate clinical findings into clear, practical guidance.`

// ─── Context Assembly ─────────────────────────────────────────────────────────

const MAX_CONTEXT_CHARS = 14_000

/** Build a structured context block from retrieved chunks, trimmed to token budget. */
export function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return ''

  const parts: string[] = []
  let totalChars = 0

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const metaParts: string[] = [`Document: "${chunk.documentTitle}"`]
    if (chunk.metadata.pageNumber) metaParts.push(`Page ${chunk.metadata.pageNumber}`)
    metaParts.push(`Relevance: ${Math.round(chunk.similarity * 100)}%`)

    const entry = `[Source ${i + 1}] ${metaParts.join(' | ')}\n${chunk.content}`
    if (totalChars + entry.length > MAX_CONTEXT_CHARS) break
    parts.push(entry)
    totalChars += entry.length
  }

  return parts.join('\n\n---\n\n')
}

// ─── Source Citation Mapping ──────────────────────────────────────────────────

export function chunksToSources(chunks: RetrievedChunk[]): Source[] {
  const seen = new Map<string, RetrievedChunk>()
  for (const chunk of chunks) {
    const existing = seen.get(chunk.documentId)
    if (!existing || chunk.similarity > existing.similarity) {
      seen.set(chunk.documentId, chunk)
    }
  }
  return Array.from(seen.values()).map(chunk => ({
    id: chunk.id,
    title: chunk.documentTitle,
    documentName: chunk.originalFilename,
    pageNumber: chunk.metadata.pageNumber,
    excerpt: chunk.content.slice(0, 220).trim() + (chunk.content.length > 220 ? '…' : ''),
  }))
}

// ─── Not-Found Detection ──────────────────────────────────────────────────────

const NOT_FOUND_PATTERNS = [
  "don't have enough information",
  "i don't have enough",
  "not in the knowledge base",
  "no relevant information",
  "cannot find",
]

export function detectNotFoundNote(content: string): string | undefined {
  const lower = content.toLowerCase()
  if (NOT_FOUND_PATTERNS.some(p => lower.includes(p))) {
    return "This question may be outside Devy's current knowledge base. For professional guidance, please consult a qualified specialist."
  }
  return undefined
}
