import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: [
    '/',
    '/jobs',
    '/jobs/[id]',
    '/how-it-works',
    '/pricing',
    '/about',
    '/api/webhooks',
  ],
  ignoredRoutes: [
    '/api/webhooks',
  ],
})

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}