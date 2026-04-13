/** @type {import('next').NextConfig} */

// ─── HTTP Security Headers ────────────────────────────────────────────────────
// Applied to every response.  CSP is intentionally permissive for Next.js
// compatibility (unsafe-inline required for styled-jsx / Tailwind JIT).
// For stricter CSP in production, adopt a nonce-based approach with
// next/headers and middleware.

const SUPABASE_HOST = 'sitzizsdkcfywflbcwar.supabase.co'

const cspDirectives = [
  "default-src 'self'",
  // Next.js hydration requires unsafe-inline and unsafe-eval in development.
  // For production you can tighten this with nonces.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://placehold.co https://${SUPABASE_HOST}`,
  "font-src 'self'",
  // Supabase (REST + Realtime), OpenAI, PubMed
  `connect-src 'self' https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api.openai.com https://eutils.ncbi.nlm.nih.gov https://www.ncbi.nlm.nih.gov https://pmc.ncbi.nlm.nih.gov`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

/** @type {import('next').NextConfig['headers']} */
async function securityHeaders() {
  return [
    {
      source: '/(.*)',
      headers: [
        // Prevent clickjacking.
        { key: 'X-Frame-Options', value: 'DENY' },
        // Prevent MIME sniffing.
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        // Enforce HTTPS for 1 year (enable once you have a real TLS cert).
        // { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        // Limit referrer exposure.
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // Disable browser features not used by this app.
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        // DNS prefetch for performance (low-risk).
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        // Content Security Policy.
        { key: 'Content-Security-Policy', value: cspDirectives },
      ],
    },
  ]
}

const nextConfig = {
  eslint: {
    // Lint errors reported but don't fail the build — run `npm run lint` locally
    ignoreDuringBuilds: true,
  },
  headers: securityHeaders,
  images: {
    remotePatterns: [
      { hostname: 'placehold.co' },
    ],
  },
  experimental: {
    // pdf-parse and mammoth use Node.js native modules — must not be bundled by webpack
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
}

export default nextConfig
