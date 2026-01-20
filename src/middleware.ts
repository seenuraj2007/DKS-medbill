import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateCSRFToken, generateCSRFToken } from '@/lib/csrf'
import { getClientIdentifier, checkRateLimit, getRateLimitHeaders } from '@/lib/rateLimiter'

const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH']
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']
const RATE_LIMITS: Record<string, number> = {
  '/api/auth/login': 5,
  '/api/auth/signup': 3,
  '/api/auth/forgot-password': 3,
  '/api/auth/reset-password': 3,
}

export function middleware(req: NextRequest) {
  const response = NextResponse.next()

  if (req.nextUrl.pathname.startsWith('/api/')) {
    const endpoint = req.nextUrl.pathname

    if (stateChangingMethods.includes(req.method)) {
      const csrfToken = req.cookies.get('csrf-token')?.value ||
                        req.headers.get('x-csrf-token')

      console.log('CSRF check:', { endpoint, hasToken: !!csrfToken, token: csrfToken?.substring(0, 20) + '...' })
      
      if (!csrfToken || !validateCSRFToken(csrfToken)) {
        console.log('CSRF validation failed')
        return new NextResponse(
          JSON.stringify({
            error: 'Invalid CSRF token'
          }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    if (endpoint in RATE_LIMITS) {
      const identifier = getClientIdentifier(req)
      const limit = RATE_LIMITS[endpoint] || 100
      const result = checkRateLimit(identifier, limit, 5 * 60 * 1000)

      if (!result.success) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            retryAfter: result.resetTime
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...getRateLimitHeaders(result)
            }
          }
        )
      }
    }
  }

  if (SAFE_METHODS.includes(req.method)) {
    const token = generateCSRFToken()
    response.cookies.set('csrf-token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60
    })
    response.headers.set('x-csrf-token', token)
  }

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
