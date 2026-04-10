/**
 * Fail-fast environment variable validation.
 *
 * Call validateEnv() once at application startup (e.g. in next.config.mjs or
 * a root layout) so missing vars surface immediately rather than at runtime.
 *
 * NEVER prefix server-side secrets with NEXT_PUBLIC_.  Only truly public values
 * (Supabase project URL, anon key) should be exposed to the browser.
 */

const REQUIRED_SERVER = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

/** Guard: throws if any required server-side env var is missing. */
export function validateEnv(): void {
  const missing = REQUIRED_SERVER.filter(k => !process.env[k])
  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example to .env.local and fill in the values.\n' +
      'See the project README for details.',
    )
  }
}

/**
 * Typed env accessor — throws at call-site if the variable is missing.
 * Prefer this over process.env[key]! to get better error messages.
 */
export function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) {
    throw new Error(`[env] Required environment variable "${key}" is not set.`)
  }
  return val
}

/** Asserts the service-role key is never shipped to the browser. */
export function assertServerOnly(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[env] This module must only be used in server-side code. ' +
      'It must not be imported in client components or browser bundles.',
    )
  }
}
