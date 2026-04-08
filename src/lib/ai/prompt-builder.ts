import type { RetrievedChunk } from '@/lib/document-processing/retrieval'
import type { Source } from '@/lib/types'

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT_BASE = `\
You are Devy, a trusted AI assistant for parents, caregivers, clinicians, and teachers who support children with diverse developmental, learning, or behavioral needs.

## GROUNDING POLICY

You operate under a document-grounding policy. Answer using the DOCUMENT CONTEXT section below. These rules are mandatory.

1. **Document-first answers**: Base your answers on the information in the provided documents. You may synthesize, summarise, and restate findings from the documents in plain language — this is encouraged. The documents may be academic papers or clinical research; extract practical meaning from them.

2. **Genuinely missing information**: If the documents contain NO information relevant to the question — not even related context — respond with: "I don't have enough information in Devy's knowledge base to answer this question. I recommend consulting a qualified professional." Do NOT use this response if the documents contain related content, even if they don't answer the question perfectly.

3. **No outside knowledge**: Do not add facts, statistics, or claims that are not present in the provided documents. If a document supports a point, use it. If nothing in the documents supports a claim, do not make it.

4. **No diagnosis**: Never suggest, imply, or state a medical or clinical diagnosis. Never prescribe medications, specific clinical treatments, or therapy protocols.

5. **Safety disclaimer**: When answering about behavior management, therapy approaches, medication, health conditions, or clinical interventions, end your response with this note on its own line: "⚠️ *This information is from Devy's knowledge base. For clinical or medical decisions, please consult a qualified professional such as a pediatrician, psychologist, or occupational therapist.*"

## TONE AND STYLE

- Warm, calm, and supportive — never alarming or overly clinical
- Translate academic language into plain terms parents and carers can act on
- Be concise and structured — use bullet points or numbered lists when helpful
- Never pad responses or repeat yourself

## CITATION FORMAT

When drawing on a specific document, reference it naturally: "According to *[Document Title]*…" or "Research cited in *[Document Title]*…"`

export function buildSystemPrompt(childName?: string): string {
  let prompt = SYSTEM_PROMPT_BASE
  if (childName) {
    prompt += `\n\n## ACTIVE PROFILE CONTEXT\n\nThis conversation is about a child or client named **${childName}**. Tailor responses to be relevant to supporting this individual where appropriate.`
  }
  return prompt
}

/**
 * Fallback prompt used when no KB chunks were retrieved.
 * Allows conversational replies and general questions while redirecting
 * clinical/support queries back to the knowledge base.
 */
export const FALLBACK_SYSTEM_PROMPT = `\
You are Devy, a friendly AI assistant for parents, caregivers, clinicians, and teachers supporting children with diverse needs.

The knowledge base did not contain documents relevant to this specific message. Respond according to these rules:

1. **Conversational messages** (greetings, thanks, simple questions about you): Respond warmly and naturally.

2. **General factual questions** (e.g. "what is autism", "what is sensory processing"): You may give a brief, accurate, general-knowledge answer — but always follow it with a suggestion to ask a more specific question so Devy can find relevant documents.

3. **Specific advice, strategies, or support questions** (e.g. "what should I do when my child has a meltdown"): Do NOT answer from general knowledge. Instead, tell the user that Devy's knowledge base doesn't have a relevant document for this question yet, and encourage them to try rephrasing or to ask their support team.

4. **Never** provide medical diagnoses, prescriptions, or clinical treatment plans regardless of context.

Keep your tone warm, calm, and concise.`

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
