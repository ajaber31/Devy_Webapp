/**
 * Lightweight in-process rate limiter.
 *
 * ⚠ PRODUCTION NOTE: This uses a module-level Map which is scoped to a single
 * server process.  On Vercel (serverless), each function instance has its own
 * Map, so limits are per-instance rather than per-deployment.  For strict
 * enforcement across instances, replace this with a distributed store:
 *   - Upstash Redis + @upstash/ratelimit  (recommended for Vercel)
 *   - Vercel KV
 *   - Supabase function invocation tracking table
 *
 * Even in-process this meaningfully reduces abuse within a cold-start window
 * and acts as a first line of defence against runaway loops.
 */

interface Bucket {
  count: number
  windowStart: number
}

const _store = new Map<string, Bucket>()

// Sweep expired buckets every 2 minutes to prevent memory leaks.
const SWEEP_INTERVAL_MS = 2 * 60 * 1_000
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    _store.forEach((bucket, key) => {
      if (now - bucket.windowStart > SWEEP_INTERVAL_MS) _store.delete(key)
    })
  }, SWEEP_INTERVAL_MS)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAtMs: number
}

export interface RateLimitConfig {
  /** Window duration in milliseconds. */
  windowMs: number
  /** Maximum number of requests allowed within the window. */
  maxRequests: number
}

/**
 * Check and update the rate-limit bucket for a given key.
 *
 * @param key          Unique identifier — typically `"userId:endpoint"` or `"ip:endpoint"`.
 * @param config       Window size and request cap.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const existing = _store.get(key)

  if (!existing || now - existing.windowStart >= config.windowMs) {
    _store.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: config.maxRequests - 1, resetAtMs: now + config.windowMs }
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAtMs: existing.windowStart + config.windowMs,
    }
  }

  existing.count++
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAtMs: existing.windowStart + config.windowMs,
  }
}

// ─── Pre-configured limiters ──────────────────────────────────────────────────

/** Chat messages: 30 per user per minute. */
export const CHAT_LIMIT: RateLimitConfig = { windowMs: 60_000, maxRequests: 30 }

/** Auth actions (sign-in, sign-up, forgot-password): 10 per IP per minute. */
export const AUTH_LIMIT: RateLimitConfig = { windowMs: 60_000, maxRequests: 10 }

/** Admin operations: 60 per user per minute. */
export const ADMIN_LIMIT: RateLimitConfig = { windowMs: 60_000, maxRequests: 60 }

/** Document processing: 5 per user per minute (expensive pipeline). */
export const PROCESS_LIMIT: RateLimitConfig = { windowMs: 60_000, maxRequests: 5 }
