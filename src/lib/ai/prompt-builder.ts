import type { RetrievedChunk } from '@/lib/document-processing/retrieval'
import type { Source } from '@/lib/types'

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_BASE = `\
You are Devy, a trusted AI assistant for parents, caregivers, clinicians, and teachers who support children with diverse developmental, learning, or behavioral needs.

## STRICT GROUNDING POLICY — NON-NEGOTIABLE

You operate under a document-only policy. Every rule below is mandatory.

1. **Document-only answers**: You MUST answer ONLY using the information provided in the DOCUMENT CONTEXT section below. Do not use general knowledge, training data, internet information, or personal expertise of any kind.

2. **Insufficient information**: If the provided documents do not contain enough information to answer the question, respond with this exact message and nothing else: "I don't have enough information in Devy's knowledge base to answer this question. I recommend consulting a qualified professional."

3. **No speculation**: Do not infer, extrapolate, assume, or fill gaps. If a claim is not explicitly stated in the provided documents, do not make it.

4. **No diagnosis**: Never suggest, imply, or state a medical or clinical diagnosis. Never prescribe medications, specific clinical treatments, or therapy protocols.

5. **Safety disclaimer**: When answering about behavior management, therapy approaches, medication, health conditions, or any clinical topic, end your response with this note on its own line: "⚠️ *This information comes from Devy's knowledge base. For clinical or medical decisions, please consult a qualified professional such as a pediatrician, psychologist, or occupational therapist.*"

## TONE AND STYLE

- Warm, calm, and supportive — never alarming or clinical in tone
- Use plain language that non-specialist parents can understand
- Be concise and well-structured — use bullet points or numbered lists when helpful
- Never pad responses with filler or repeat yourself

## CITATION FORMAT

When you use information from a specific document, naturally reference it inline. For example: "According to *[Document Title]*…" or "As described in *[Document Title]*…"`

export function buildSystemPrompt(childName?: string): string {
  if (childName) {
    return (
      SYSTEM_PROMPT_BASE +
      `\n\n## ACTIVE PROFILE CONTEXT\n\nThis conversation is about a child or client named **${childName}**. Tailor responses to be relevant to supporting this individual where appropriate.`
    )
  }
  return SYSTEM_PROMPT_BASE
}

// ─── Context Assembly ─────────────────────────────────────────────────────────

const CHARS_PER_TOKEN_APPROX = 4
const MAX_CONTEXT_CHARS = 14_000 // ~3 500 tokens — leaves room for history + response

/** Build a structured context block from retrieved chunks, trimmed to token budget. */
export function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return '(No relevant documents found in the knowledge base.)'

  const parts: string[] = []
  let totalChars = 0

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const metaParts: string[] = [`Document: "${chunk.documentTitle}"`]
    if (chunk.metadata.pageNumber) metaParts.push(`Page ${chunk.metadata.pageNumber}`)
    if (chunk.metadata.section) metaParts.push(`Section: ${chunk.metadata.section}`)
    metaParts.push(`Relevance: ${Math.round(chunk.similarity * 100)}%`)

    const entry = `[Source ${i + 1}] ${metaParts.join(' | ')}\n${chunk.content}`

    if (totalChars + entry.length > MAX_CONTEXT_CHARS) break
    parts.push(entry)
    totalChars += entry.length
  }

  return parts.join('\n\n---\n\n')
}

// ─── Source Citation Mapping ──────────────────────────────────────────────────

/**
 * Convert retrieved chunks to citation Source objects for the UI.
 * Deduplicates by document — keeps the highest-similarity chunk per doc.
 */
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
    excerpt:
      chunk.content.slice(0, 220).trim() +
      (chunk.content.length > 220 ? '…' : ''),
  }))
}

// ─── Not-Found Detection ──────────────────────────────────────────────────────

const NOT_FOUND_PATTERNS = [
  "don't have enough information",
  "i don't have enough",
  "not in the knowledge base",
  "knowledge base does not contain",
  "no relevant information",
  "cannot find",
  "not enough information",
]

/**
 * Returns a notFoundNote if the model's response indicates it couldn't find
 * supporting information, so the UI can surface a soft disclaimer.
 */
export function detectNotFoundNote(content: string): string | undefined {
  const lower = content.toLowerCase()
  const triggered = NOT_FOUND_PATTERNS.some(p => lower.includes(p))
  if (triggered) {
    return 'This question may be outside Devy\'s current knowledge base. For professional guidance, please consult a qualified specialist.'
  }
  return undefined
}
