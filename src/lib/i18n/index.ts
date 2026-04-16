import { cookies } from 'next/headers'
import { translations } from './translations'
export type { Lang } from './translations'
export { translations }

export const DEFAULT_LANG = 'en' as const
export const LANG_COOKIE = 'devy-lang'

/**
 * Read the active language from the request cookie (server components only).
 * Falls back to 'en' if the cookie is absent or invalid.
 */
export async function getLang(): Promise<'en' | 'fr'> {
  const cookieStore = await cookies()
  const val = cookieStore.get(LANG_COOKIE)?.value
  return val === 'fr' ? 'fr' : 'en'
}

/**
 * Return the translation object for a given language.
 */
export function getT(lang: 'en' | 'fr') {
  return translations[lang]
}
