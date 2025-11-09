import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow embed routes to be loaded in iframes from any domain
  if (pathname.startsWith('/embed')) {
    const response = NextResponse.next()

    // Remove X-Frame-Options to allow embedding
    response.headers.delete('X-Frame-Options')

    // Set CSP to allow embedding from any domain
    response.headers.set(
      'Content-Security-Policy',
      "frame-ancestors *"
    )

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/embed/:path*']
}
