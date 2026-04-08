import OpenAI from 'openai'

const BATCH_SIZE = 100
const MODEL = 'text-embedding-3-small'

let _openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _openai
}

/** Generate embeddings for an array of text strings.
 *  Batches requests to stay within OpenAI limits.
 *  Returns a 2D array: embeddings[i] corresponds to texts[i].
 */
export async function generateEmbeddings(
  texts: string[],
): Promise<{ embeddings: number[][]; error?: string }> {
  if (texts.length === 0) return { embeddings: [] }

  const openai = getOpenAI()
  const allEmbeddings: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)

    let attempts = 0
    const maxAttempts = 4

    while (attempts < maxAttempts) {
      try {
        const response = await openai.embeddings.create({
          model: MODEL,
          input: batch,
        })

        const sorted = response.data.sort((a, b) => a.index - b.index)
        allEmbeddings.push(...sorted.map(d => d.embedding))
        break
      } catch (err: unknown) {
        attempts++
        const isRateLimit =
          err instanceof OpenAI.APIError && err.status === 429

        if (isRateLimit && attempts < maxAttempts) {
          const delay = Math.pow(2, attempts) * 1000
          await new Promise(res => setTimeout(res, delay))
          continue
        }

        const message = err instanceof Error ? err.message : String(err)
        return { embeddings: [], error: `Embedding failed on batch ${i / BATCH_SIZE}: ${message}` }
      }
    }
  }

  return { embeddings: allEmbeddings }
}
