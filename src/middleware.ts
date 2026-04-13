import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

// Paths that don't require authentication
const PUBLIC_PATHS = new Set(['/', '/login', '/signup', '/forgot-password', '/privacy', '/pricing'])

// Authenticated-but-ungated paths (user is logged in but may not have consented yet)
// The consent gate is enforced in the dashboard layout, not middleware, to keep
// middleware lightweight. /consent must remain accessible to authenticated users.
const CONSENT_PATHS = new Set(['/consent'])

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createClient(request, response)

  // getUser() validates the JWT with Supabase Auth and properly sets the auth
  // context for RLS. getSession() only reads from the cookie without verifying.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Skip auth for public paths, auth callback, consent/privacy pages, and all API routes.
  // API routes perform their own authentication (session cookie or webhook signature).
  const isPublic =
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/') ||
    CONSENT_PATHS.has(pathname)

  // Redirect unauthenticated users away from protected routes
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login/signup
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin role check is handled by the (admin) layout via getProfile().
  // Middleware only enforces authentication — role-based access is enforced server-side.

  return response
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
