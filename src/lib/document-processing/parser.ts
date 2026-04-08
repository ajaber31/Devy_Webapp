export interface ParseResult {
  text: string
  pageCount?: number
  wordCount: number
}

/** Extract plain text from a file buffer.
 *  pdf-parse v2 uses a class-based API: new PDFParse({ data }) + .getText()
 *  mammoth provides extractRawText for DOCX files.
 */
export async function extractText(
  buffer: Buffer,
  fileType: 'pdf' | 'docx' | 'txt',
): Promise<ParseResult> {
  if (fileType === 'txt') {
    const text = buffer.toString('utf-8')
    return { text, wordCount: countWords(text) }
  }

  if (fileType === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PDFParse } = require('pdf-parse') as {
      PDFParse: new (opts: { data: Buffer }) => {
        getText: () => Promise<{ text: string; total: number }>
        destroy: () => Promise<void>
      }
    }

    const parser = new PDFParse({ data: buffer })
    try {
      const result = await parser.getText()
      const text = result.text.trim()
      return { text, pageCount: result.total, wordCount: countWords(text) }
    } finally {
      await parser.destroy()
    }
  }

  if (fileType === 'docx') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth') as {
      extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }>
    }
    const result = await mammoth.extractRawText({ buffer })
    const text = result.value.trim()
    return { text, wordCount: countWords(text) }
  }

  throw new Error(`Unsupported file type: ${fileType}`)
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}
