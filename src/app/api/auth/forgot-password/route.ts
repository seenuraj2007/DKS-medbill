import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendEmail, generatePasswordResetEmail, isEmailEnabled } from '@/lib/email'
import { randomBytes } from 'crypto'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

// Generate a secure random token
function generateResetToken(): string {
  return randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive a password reset link.' },
        { status: 200 }
      )
    }

    // Generate reset token
    const token = generateResetToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      }
    })

    // Generate reset URL
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`

    // Check if email is enabled
    if (!isEmailEnabled()) {
      // When email is disabled, show the reset URL in console for admin to manually share
      console.log('[EMAIL DISABLED] Password reset token created for:', email)
      console.log('[EMAIL DISABLED] Reset URL (share manually):', resetUrl)
      
      return NextResponse.json(
        { 
          message: 'Email service is currently disabled. Please contact support to reset your password.',
          resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
        },
        { status: 200 }
      )
    }

    // Generate email content
    const emailContent = generatePasswordResetEmail(resetUrl, '1 hour')

    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (!emailSent) {
      console.error('Failed to send password reset email to:', email)
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      )
    }

    console.log('Password reset email sent to:', email)

    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive a password reset link.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
