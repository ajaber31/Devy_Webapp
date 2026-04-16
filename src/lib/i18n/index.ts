// Client-safe i18n utilities — no server-only imports here.
import { translations } from './translations'
export type { Lang, Translations } from './translations'
export { translations }

export const DEFAULT_LANG = 'en' as const
export const LANG_COOKIE = 'devy-lang'

/**
 * Return the translation object for a given language.
 * Safe to call from both Server and Client components.
 */
export function getT(lang: 'en' | 'fr') {
  return translations[lang]
}
