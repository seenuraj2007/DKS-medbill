import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { signUp } from '@/lib/auth'
import { signupSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import { checkSignupRateLimit } from '@/lib/rate-limit'
import { sendEmail, isEmailEnabled } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('[SIGNUP] Received signup request');

    const validatedData = signupSchema.parse(body)

    console.log('[SIGNUP] Validated data:', {
      email: validatedData.email.toLowerCase(),
      name: validatedData.full_name
    });

    // Check rate limit
    const rateLimit = checkSignupRateLimit(validatedData.email)

    if (!rateLimit.allowed) {
      console.log('[SIGNUP] Rate limit exceeded for email:', validatedData.email);
      return NextResponse.json(
        {
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: rateLimit.retryAfter
        },
        {
          status: 429,
          headers: { 'Retry-After': rateLimit.retryAfter.toString() }
        }
      )
    }

    // Use our custom signUp function with bcrypt password hashing
    const result = await signUp(validatedData.email, validatedData.password, validatedData.full_name)

    if (!result) {
      // Check if user already exists to provide a more specific error
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email.toLowerCase() }
      });

      if (existingUser) {
        console.log('[SIGNUP] User already exists in database:', existingUser.id);
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 400 }
        )
      }

      console.log('[SIGNUP] SignUp returned null but user not found - unknown error');
      return NextResponse.json(
        { error: 'Unable to create account. Please try again.' },
        { status: 500 }
      )
    }

    const { user } = result

    console.log('[SIGNUP] User created successfully:', user.id);

    // Create tenant for user
    const tenantSlug = `${validatedData.email.split('@')[0]}-${Date.now().toString(36)}`
    const tenant = await prisma.tenant.create({
      data: {
        name: `${validatedData.full_name || validatedData.email.split('@')[0]}'s Business`,
        slug: tenantSlug,
        ownerId: user.id,
        settings: {
          currency: 'USD',
          timezone: 'UTC',
        }
      }
    })

    console.log('[SIGNUP] Tenant created:', tenant.id);

    await prisma.member.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: 'OWNER',
        status: 'ACTIVE',
      }
    })

    await prisma.location.create({
      data: {
        tenantId: tenant.id,
        name: 'Default Location',
        type: 'WAREHOUSE',
        address: 'Main warehouse',
        isPrimary: true,
        isActive: true,
      }
    })

    // Send verification email if email is enabled
    if (user.emailVerificationToken && isEmailEnabled()) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'
      const verifyUrl = `${appUrl}/auth/verify-email?token=${user.emailVerificationToken}`

      try {
        await sendEmail({
          to: user.email,
          subject: 'Verify your email - DKS StockAlert',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Welcome to DKS StockAlert!</h2>
              <p>Hi ${validatedData.full_name},</p>
              <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
              <a href="${verifyUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Verify Email</a>
              <p>Or copy this link: ${verifyUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>Best regards,<br>DKS StockAlert Team</p>
            </div>
          `
        })
        console.log('[SIGNUP] Verification email sent to:', user.email);
      } catch (emailError) {
        console.error('[SIGNUP] Failed to send verification email:', emailError);
        // Continue without failing the signup
      }
    }

    // Return success without setting auth cookie - user must login manually
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Please sign in with your credentials.'
    }, { status: 201 })

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '3')
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())

    console.log('[SIGNUP] Signup complete, returning success response');

    return response
  } catch (error) {
    console.error('[SIGNUP] Unhandled error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
