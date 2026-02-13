import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { signIn } from '@/lib/auth'
import { loginSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import { ensureUserTenant } from '@/lib/tenant-setup'
import { checkLoginRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const validatedData = loginSchema.parse(await req.json())

    // Check rate limit
    const rateLimit = checkLoginRateLimit(validatedData.email)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter
        },
        { 
          status: 429,
          headers: { 'Retry-After': rateLimit.retryAfter.toString() }
        }
      )
    }

    // Use our custom signIn function with Neon auth
    const result = await signIn(validatedData.email, validatedData.password)

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const { user, token } = result

    // Get or create tenant for user
    let tenant = await prisma.tenant.findFirst({
      where: { ownerId: user.id }
    })

    if (!tenant) {
      tenant = await ensureUserTenant(user.id, user.email)
    }

    const member = await prisma.member.findUnique({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: user.id
        }
      }
    })

    const responseUser = {
      id: user.id,
      email: user.email,
      full_name: user.name,
      organization_id: tenant.id,
      role: member?.role || 'MEMBER',
      status: 'active',
      created_at: user.created_at,
      tenant_id: tenant.id
    }

    // Set session token cookie
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    }

    const response = NextResponse.json({ user: responseUser }, { status: 200 })

    // Add domain in production for proper cookie sharing across subdomains
    // Remove domain setting to avoid cookie issues
    response.cookies.set('auth_token', token, cookieOptions)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', LOGIN_MAX_ATTEMPTS.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

const LOGIN_MAX_ATTEMPTS = 5
