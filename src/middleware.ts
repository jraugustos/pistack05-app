import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/projects(.*)',
  '/api/projects(.*)',
  '/api/cards(.*)',
  '/api/outputs(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Em desenvolvimento, não bloquear rotas protegidas para facilitar o fluxo
  const isDev = process.env.NODE_ENV !== 'production'
  if (isProtectedRoute(req) && !isDev) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ]
}
