// Server-only i18n utilities — may only be imported in Server Components,
// Server Actions, and Route Handlers. Never import this from a Client Component.
import { cookies } from 'next/headers'
import type { Lang } from './translations'

export const LANG_COOKIE = 'devy-lang'

/**
 * Read the active language from the request cookie (server components only).
 * Falls back to 'en' if the cookie is absent or invalid.
 */
export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies()
  const val = cookieStore.get(LANG_COOKIE)?.value
  return val === 'fr' ? 'fr' : 'en'
}
