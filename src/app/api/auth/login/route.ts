import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { loginSchema } from '@/lib/validators'
import { handleApiError } from '@/lib/errorHandler'

export async function POST(req: NextRequest) {
  try {
    const validatedData = loginSchema.parse(await req.json())

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    })

    if (authError || !authData.user) {
      throw new Error('Invalid credentials')
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, organization_id, role, status, created_at, updated_at')
      .eq('id', authData.user.id)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    const response = NextResponse.json({ user }, { status: 200 })

    response.cookies.set('sb-access-token', authData.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return handleApiError(error)
  }
}
