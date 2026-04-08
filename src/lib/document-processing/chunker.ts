// 1 token ≈ 4 characters for English text (rough approximation without a tokenizer)
const CHARS_PER_TOKEN = 4

export interface ChunkOptions {
  targetTokens?: number  // default 500
  overlapTokens?: number // default 50
  minTokens?: number     // default 50 — discard tiny trailing chunks
}

export interface TextChunk {
  index: number
  content: string
  charStart: number
  charEnd: number
  approxTokens: number
}

/** Paragraph-aware sliding window chunker.
 *  Splits on double-newlines first (natural section breaks), then accumulates
 *  paragraphs until the token budget is met, steps back by the overlap amount
 *  for the next chunk.
 *  Falls back to sentence → character splits for oversized paragraphs.
 */
export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
  const {
    targetTokens = 500,
    overlapTokens = 50,
    minTokens = 50,
  } = options

  const targetChars = targetTokens * CHARS_PER_TOKEN
  const overlapChars = overlapTokens * CHARS_PER_TOKEN
  const minChars = minTokens * CHARS_PER_TOKEN

  // Split into paragraphs (double newline or more)
  const paragraphs = splitIntoParagraphs(text)

  const chunks: TextChunk[] = []
  let charOffset = 0
  let paraIdx = 0

  while (paraIdx < paragraphs.length) {
    const chunkStart = charOffset
    let chunkContent = ''
    let localOffset = charOffset

    // Accumulate paragraphs until we hit the target size
    while (paraIdx < paragraphs.length) {
      const para = paragraphs[paraIdx]
      const candidate = chunkContent ? chunkContent + '\n\n' + para : para

      if (candidate.length > targetChars && chunkContent.length > 0) {
        // Current paragraph would overflow — stop here unless we have nothing yet
        break
      }

      // If a single paragraph is larger than target, split it internally
      if (para.length > targetChars && chunkContent.length === 0) {
        const subChunks = splitLargeParagraph(para, targetChars, overlapChars, localOffset)
        chunks.push(...subChunks.map((sc, i) => ({
          ...sc,
          index: chunks.length + i,
        })))
        localOffset += para.length
        paraIdx++
        charOffset = localOffset
        chunkContent = '' // signal outer loop to restart
        break
      }

      chunkContent = candidate
      localOffset += para.length + 2 // +2 for '\n\n'
      paraIdx++
    }

    if (!chunkContent) continue // was handled by splitLargeParagraph above
    if (chunkContent.trim().length < minChars) {
      charOffset = localOffset
      continue
    }

    chunks.push({
      index: chunks.length,
      content: chunkContent.trim(),
      charStart: chunkStart,
      charEnd: chunkStart + chunkContent.length,
      approxTokens: Math.round(chunkContent.length / CHARS_PER_TOKEN),
    })

    charOffset = localOffset

    // Step back by overlap for the next chunk
    if (paraIdx < paragraphs.length && overlapChars > 0) {
      const overlapText = chunkContent.slice(-overlapChars)
      // Find how many paragraphs back we need to go to get the overlap text
      let backChars = 0
      let backIdx = paraIdx - 1
      while (backIdx >= 0 && backChars < overlapChars) {
        backChars += paragraphs[backIdx].length + 2
        backIdx--
      }
      paraIdx = Math.max(backIdx + 1, paraIdx - 1)
      charOffset = charOffset - backChars
      if (charOffset < chunkStart + minChars) {
        // prevent infinite loop — advance past the current chunk
        charOffset = chunkStart + chunkContent.length
        paraIdx = paragraphs.length // just in case
      }
    }
  }

  // Re-index to be safe
  return chunks.map((c, i) => ({ ...c, index: i }))
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
}

function splitLargeParagraph(
  para: string,
  targetChars: number,
  overlapChars: number,
  baseOffset: number,
): Omit<TextChunk, 'index'>[] {
  // Try sentence splitting first
  const sentences = para.match(/[^.!?]+[.!?]+["']?\s*/g) ?? [para]

  const chunks: Omit<TextChunk, 'index'>[] = []
  let current = ''
  let offset = baseOffset

  for (const sentence of sentences) {
    const candidate = current + sentence
    if (candidate.length > targetChars && current.length > 0) {
      chunks.push({
        content: current.trim(),
        charStart: offset,
        charEnd: offset + current.length,
        approxTokens: Math.round(current.length / CHARS_PER_TOKEN),
      })
      const overlapStart = Math.max(0, current.length - overlapChars)
      const overlap = current.slice(overlapStart)
      offset = offset + overlapStart
      current = overlap + sentence
    } else {
      current = candidate
    }
  }

  if (current.trim().length > 0) {
    chunks.push({
      content: current.trim(),
      charStart: offset,
      charEnd: offset + current.length,
      approxTokens: Math.round(current.length / CHARS_PER_TOKEN),
    })
  }

  return chunks
}
