import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  // Bypass auth in local dev when DISABLE_AUTH is set
  if (process.env.DISABLE_AUTH === "1") {
    return NextResponse.next()
  }

  // Allow public routes
  const publicPaths = [
    '/',
    '/jobs',
    '/api/jobs/search',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/public'
  ]

  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  // For protected routes, would check Clerk auth here
  // This is a placeholder for when DISABLE_AUTH is not set
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ]
}
