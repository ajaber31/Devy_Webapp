import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

// Paths that don't require authentication
const PUBLIC_PATHS = new Set(['/', '/login', '/signup'])

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const supabase = createClient(request, response)

  // Refresh session — required by @supabase/ssr to keep cookies in sync
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Skip auth for public paths and auth callback
  const isPublic = PUBLIC_PATHS.has(pathname) || pathname.startsWith('/auth/')

  // Redirect unauthenticated users away from protected routes
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from login/signup
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protect admin routes — verify role from DB
  if (session && pathname.startsWith('/admin')) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const profile = data as { role: string } | null
    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
