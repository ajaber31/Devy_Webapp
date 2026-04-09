import type { Source } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PubMedSource {
  pmid: string
  pmcid?: string        // PMC ID if available (enables full-text retrieval)
  title: string
  abstract: string
  fullText?: string     // Full article text from PMC (when available)
  authors: string       // "Smith J, Jones K, et al."
  journal: string
  year: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
const TOOL = 'devy-app'
const EMAIL = 'admin@devy.app' // Required by NCBI for responsible use

// ─── XML Helpers ──────────────────────────────────────────────────────────────

function extractXmlTag(block: string, tag: string): string {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(block)
  if (!match) return ''
  return stripTags(match[1])
}

function extractAllXmlTags(block: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi')
  const results: string[] = []
  let match: RegExpExecArray | null
  while ((match = regex.exec(block)) !== null) {
    const text = stripTags(match[1]).trim()
    if (text) results.push(text)
  }
  return results
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, ''))
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── PubMed Abstract XML Parsing ──────────────────────────────────────────────

function parsePubMedXml(xml: string): PubMedSource[] {
  const rawBlocks: string[] = []
  const articleRegex = /<PubmedArticle>[\s\S]*?<\/PubmedArticle>/gi
  let m: RegExpExecArray | null
  while ((m = articleRegex.exec(xml)) !== null) {
    rawBlocks.push(m[0])
  }

  return rawBlocks.map(block => {
    const pmid = extractXmlTag(block, 'PMID')
    const title = extractXmlTag(block, 'ArticleTitle')

    // Abstract may have multiple labeled sections — concatenate all
    const abstractParts = extractAllXmlTags(block, 'AbstractText')
    const abstract = abstractParts.join(' ').trim()

    // Authors: up to 3, then "et al."
    const lastNames = extractAllXmlTags(block, 'LastName')
    const foreNames = extractAllXmlTags(block, 'ForeName')
    const authorList = lastNames.slice(0, 3).map((ln, i) => {
      const fn = foreNames[i] ?? ''
      return fn ? `${ln} ${fn.charAt(0)}` : ln
    })
    const authors = authorList.length < lastNames.length
      ? `${authorList.join(', ')}, et al.`
      : authorList.join(', ')

    // Journal title
    const journalBlock = /<Journal>([\s\S]*?)<\/Journal>/i.exec(block)?.[0] ?? ''
    const journal = extractXmlTag(journalBlock, 'Title') ||
      extractXmlTag(journalBlock, 'ISOAbbreviation') ||
      'Unknown Journal'

    // Publication year
    const pubDateBlock = /<PubDate>([\s\S]*?)<\/PubDate>/i.exec(block)?.[0] ?? ''
    const year = extractXmlTag(pubDateBlock, 'Year') ||
      extractXmlTag(pubDateBlock, 'MedlineDate').slice(0, 4) ||
      ''

    return { pmid, title, abstract, authors, journal, year }
  }).filter(s => s.pmid && s.title && s.abstract.length > 50)
}

// ─── PMC Full Text Parsing ────────────────────────────────────────────────────

function parsePmcFullText(xml: string): Map<string, string> {
  const result = new Map<string, string>()

  // PMC efetch returns <article> blocks, each prefixed by a PMID in <article-id>
  const articleRegex = /<article[\s\S]*?<\/article>/gi
  let m: RegExpExecArray | null

  while ((m = articleRegex.exec(xml)) !== null) {
    const block = m[0]

    // Get the PMID for this article
    const pmidMatch = /<article-id[^>]*pub-id-type="pmid"[^>]*>([\s\S]*?)<\/article-id>/i.exec(block)
    if (!pmidMatch) continue
    const pmid = stripTags(pmidMatch[1]).trim()
    if (!pmid) continue

    // Extract sections: abstract, intro, methods, results, discussion
    const sections: string[] = []

    // Abstract
    const abstractText = extractAllXmlTags(block, 'abstract')
    if (abstractText.length > 0) {
      sections.push('Abstract:\n' + abstractText.join('\n'))
    }

    // Body sections (intro, methods, results, discussion)
    const bodyRegex = /<sec[\s\S]*?<\/sec>/gi
    let secMatch: RegExpExecArray | null
    while ((secMatch = bodyRegex.exec(block)) !== null) {
      const sec = secMatch[0]
      const secTitle = extractXmlTag(sec, 'title')
      const secParagraphs = extractAllXmlTags(sec, 'p')
      if (secParagraphs.length > 0) {
        const sectionText = secTitle
          ? `${secTitle}:\n${secParagraphs.join('\n')}`
          : secParagraphs.join('\n')
        sections.push(sectionText)
      }
    }

    if (sections.length > 0) {
      // Cap full text at 15,000 chars to stay within token budget
      const fullText = sections.join('\n\n').slice(0, 15_000)
      result.set(pmid, fullText)
    }
  }

  return result
}

// ─── API Calls ────────────────────────────────────────────────────────────────

async function esearch(term: string, retmax: number, signal: AbortSignal): Promise<string[]> {
  const url = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=${retmax}&retmode=json&tool=${TOOL}&email=${EMAIL}`
  const res = await fetch(url, { signal })
  if (!res.ok) return []
  const data = await res.json()
  return (data?.esearchresult?.idlist as string[]) ?? []
}

async function efetchAbstracts(pmids: string[], signal: AbortSignal): Promise<string> {
  const url = `${PUBMED_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml&rettype=abstract&tool=${TOOL}&email=${EMAIL}`
  const res = await fetch(url, { signal })
  if (!res.ok) return ''
  return res.text()
}

/**
 * Look up PMC IDs for a list of PMIDs via elink.
 * Returns a Map<pmid, pmcid> for papers available in PMC.
 */
async function getPmcIds(pmids: string[], signal: AbortSignal): Promise<Map<string, string>> {
  const idParam = pmids.map(id => `id=${id}`).join('&')
  const url = `${PUBMED_BASE}/elink.fcgi?dbfrom=pubmed&db=pmc&${idParam}&retmode=json&tool=${TOOL}&email=${EMAIL}`
  const result = new Map<string, string>()

  try {
    const res = await fetch(url, { signal })
    if (!res.ok) return result
    const data = await res.json()

    // elink returns an array of linksets, one per input PMID
    const linksets = data?.linksets ?? []
    for (const ls of linksets) {
      const pmid = String(ls?.ids?.[0] ?? '')
      const pmcLinks = ls?.linksetdbs?.find((db: { dbto: string }) => db.dbto === 'pmc')
      const pmcid = pmcLinks?.links?.[0]
      if (pmid && pmcid) {
        result.set(pmid, String(pmcid))
      }
    }
  } catch {
    // elink failure is non-fatal — we fall back to abstracts
  }

  return result
}

/**
 * Fetch full text XML from PMC for a list of PMC IDs.
 * Returns a Map<pmid, fullText> for papers with parseable full text.
 */
async function fetchPmcFullText(
  pmidToPmcid: Map<string, string>,
  signal: AbortSignal,
): Promise<Map<string, string>> {
  if (pmidToPmcid.size === 0) return new Map()

  const pmcIds = Array.from(pmidToPmcid.values()).join(',')
  const url = `${PUBMED_BASE}/efetch.fcgi?db=pmc&id=${pmcIds}&rettype=full&retmode=xml&tool=${TOOL}&email=${EMAIL}`

  try {
    const res = await fetch(url, { signal })
    if (!res.ok) return new Map()
    const xml = await res.text()
    const pmcIdToText = parsePmcFullText(xml)

    // Re-key from PMCID → text to PMID → text
    const pmidToText = new Map<string, string>()
    pmidToPmcid.forEach((pmcid, pmid) => {
      const text = pmcIdToText.get(pmcid)
      if (text) pmidToText.set(pmid, text)
    })
    return pmidToText
  } catch {
    return new Map()
  }
}

// ─── Main Search ──────────────────────────────────────────────────────────────

/**
 * Search PubMed for peer-reviewed abstracts (or full text if available in PMC).
 * Tries systematic reviews / meta-analyses first, falls back to all article types.
 * Returns [] on any network or parse error — never throws.
 */
export async function searchPubMed(
  query: string,
  maxResults = 5,
): Promise<PubMedSource[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    // Step 1 — esearch with high-quality publication types
    const highQualityTerm = `${query} AND (systematic review[pt] OR meta-analysis[pt] OR randomized controlled trial[pt])`
    let pmids = await esearch(highQualityTerm, maxResults, controller.signal)

    // Step 2 — fall back to any article type if no high-quality results
    if (pmids.length === 0) {
      pmids = await esearch(query, maxResults, controller.signal)
    }

    if (pmids.length === 0) return []

    // Step 3 — fetch abstracts
    const abstractXml = await efetchAbstracts(pmids, controller.signal)
    const sources = parsePubMedXml(abstractXml)

    // Step 4 — attempt PMC full-text for Open Access papers
    try {
      const pmidToPmcid = await getPmcIds(pmids, controller.signal)
      if (pmidToPmcid.size > 0) {
        const pmidToFullText = await fetchPmcFullText(pmidToPmcid, controller.signal)
        for (const source of sources) {
          const fullText = pmidToFullText.get(source.pmid)
          if (fullText) {
            source.pmcid = pmidToPmcid.get(source.pmid)
            source.fullText = fullText
          }
        }
      }
    } catch {
      // Full-text retrieval failure is non-fatal — abstracts are sufficient
    }

    return sources
  } catch (err) {
    console.error('[pubmed] search error:', err instanceof Error ? err.message : String(err))
    return []
  } finally {
    clearTimeout(timeout)
  }
}

// ─── Context Block ────────────────────────────────────────────────────────────

const MAX_PUBMED_CONTEXT_CHARS = 8_000
const MAX_ABSTRACT_CHARS = 800

/**
 * Build a context block from PubMed results for injection into the system prompt.
 * Uses full text when available, otherwise truncated abstract.
 */
export function buildPubMedContextBlock(sources: PubMedSource[]): string {
  const parts: string[] = []
  let total = 0

  for (let i = 0; i < sources.length; i++) {
    const s = sources[i]
    const content = s.fullText
      ? s.fullText.slice(0, 2_000) + (s.fullText.length > 2_000 ? '…' : '')
      : (s.abstract.length > MAX_ABSTRACT_CHARS
          ? s.abstract.slice(0, MAX_ABSTRACT_CHARS) + '…'
          : s.abstract)

    const source = s.fullText ? `PMC Full Text` : `PubMed Abstract`
    const entry = `[${source} ${i + 1}] ${s.title} | ${s.authors} | ${s.journal} (${s.year}) | PMID: ${s.pmid}\n${content}`
    if (total + entry.length > MAX_PUBMED_CONTEXT_CHARS) break
    parts.push(entry)
    total += entry.length
  }

  return parts.join('\n\n---\n\n')
}

// ─── Source Mapping ───────────────────────────────────────────────────────────

/**
 * Map PubMed results to the Source type so they can be stored in messages.sources
 * and detected by the UI (id starts with 'pubmed-').
 */
export function pubMedSourcesToSources(sources: PubMedSource[]): Source[] {
  return sources.map(s => ({
    id: `pubmed-${s.pmid}`,
    title: s.title,
    documentName: `${s.journal} (${s.year})`,
    pageNumber: undefined,
    excerpt: s.abstract.slice(0, 220).trim() + (s.abstract.length > 220 ? '…' : ''),
  }))
}
