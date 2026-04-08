/** Returns the base URL for server-to-server fetch calls.
 *  Uses 127.0.0.1 in dev to avoid the localhost deadlock with Next.js dev server.
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://127.0.0.1:3000'
}
