/**
 * Distributed rate limiter — uses Upstash Redis when credentials are present,
 * falls back to an in-process Map for local development or if Upstash isn't
 * configured yet.
 *
 * PRODUCTION SETUP:
 *   1. Create a free Upstash Redis database at https://console.upstash.com
 *   2. Add these env vars in Vercel (and .env.local for local dev):
 *        UPSTASH_REDIS_REST_URL=https://....upstash.io
 *        UPSTASH_REDIS_REST_TOKEN=AX...
 *   Once those are set, all instances share the same rate-limit counters.
 *
 * Without Upstash, limits are per-serverless-instance (still useful as a
 * first line of defence but bypassable by distributing requests).
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ─── Upstash setup (lazy-initialised) ────────────────────────────────────────

type UpstashLimiter = {
  limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }>
}

let _upstashLimiters: Map<string, UpstashLimiter> | null = null

function getUpstashLimiters(): Map<string, UpstashLimiter> | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  if (!_upstashLimiters) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    _upstashLimiters = new Map([
      ['chat',    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '1 m'),  prefix: 'rl:chat' })],
      ['auth',    new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m'),  prefix: 'rl:auth' })],
      ['admin',   new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m'),  prefix: 'rl:admin' })],
      ['process', new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5,  '1 m'),  prefix: 'rl:process' })],
    ])
  }

  return _upstashLimiters
}

// ─── In-process fallback ──────────────────────────────────────────────────────

interface Bucket {
  count: number
  windowStart: number
}

const _store = new Map<string, Bucket>()

const SWEEP_INTERVAL_MS = 2 * 60 * 1_000
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    _store.forEach((bucket, key) => {
      if (now - bucket.windowStart > SWEEP_INTERVAL_MS) _store.delete(key)
    })
  }, SWEEP_INTERVAL_MS)
}

// ─── Public API ───────────────────────────────────────────────────────────────

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
  /** Limiter name — maps to the Upstash limiter when distributed mode is active. */
  name: 'chat' | 'auth' | 'admin' | 'process'
}

/**
 * Check and update the rate-limit bucket for a given key.
 * Uses Upstash Redis (distributed, cross-instance) when configured,
 * otherwise falls back to an in-process Map.
 *
 * @param key     Unique identifier — typically `"userId:endpoint"` or `"ip:endpoint"`.
 * @param config  Window size, request cap, and limiter name.
 */
export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const limiters = getUpstashLimiters()

  if (limiters) {
    const limiter = limiters.get(config.name)
    if (limiter) {
      const { success, remaining, reset } = await limiter.limit(key)
      return { allowed: success, remaining, resetAtMs: reset }
    }
  }

  // ── In-process fallback ──
  return checkInProcess(key, config)
}

function checkInProcess(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const existing = _store.get(key)

  if (!existing || now - existing.windowStart >= config.windowMs) {
    _store.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: config.maxRequests - 1, resetAtMs: now + config.windowMs }
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAtMs: existing.windowStart + config.windowMs }
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
export const CHAT_LIMIT:    RateLimitConfig = { windowMs: 60_000, maxRequests: 30, name: 'chat' }

/** Auth actions (sign-in, sign-up, forgot-password): 10 per IP/email per minute. */
export const AUTH_LIMIT:    RateLimitConfig = { windowMs: 60_000, maxRequests: 10, name: 'auth' }

/** Admin operations: 60 per user per minute. */
export const ADMIN_LIMIT:   RateLimitConfig = { windowMs: 60_000, maxRequests: 60, name: 'admin' }

/** Document processing: 5 per user per minute (expensive pipeline). */
export const PROCESS_LIMIT: RateLimitConfig = { windowMs: 60_000, maxRequests: 5,  name: 'process' }
