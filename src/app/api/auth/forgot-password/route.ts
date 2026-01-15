import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { sendEmail, generatePasswordResetEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'
import { addHours } from 'date-fns'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const user = db.prepare('SELECT id, email, full_name FROM users WHERE email = ?').get(email) as any

    if (user) {
      const token = uuidv4()
      const expiresAt = addHours(new Date(), 1)

      db.prepare(`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (?, ?, ?)
      `).run(user.id, token, expiresAt.toISOString())

      const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
      
      const emailResult = sendEmail({
        to: email,
        ...generatePasswordResetEmail(resetUrl, '1 hour'),
      })

      console.log('Password reset email sent:', emailResult)
    }

    return NextResponse.json({
      message: 'If an account exists with that email, a password reset link has been sent.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
