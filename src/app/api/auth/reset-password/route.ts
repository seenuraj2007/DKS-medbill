import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { resetPassword } from '@/lib/auth'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = resetPasswordSchema.parse(body)

    const success = await resetPassword(token, password)

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Password reset successful. You can now log in with your new password.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed', details: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
