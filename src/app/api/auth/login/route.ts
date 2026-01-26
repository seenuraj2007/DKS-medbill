import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { loginSchema } from '@/lib/validators'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = loginSchema.parse(body)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User not found after authentication' },
        { status: 401 }
      )
    }

    // Try to get user profile
    // eslint-disable-next-line prefer-const
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // If user doesn't exist, create them
    if (userError) {
      console.log('Creating user profile for:', authData.user.id)
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: authData.user.user_metadata?.full_name || null,
          organization_id: null,
          role: 'member',
          status: 'active'
        })
        .select()
        .single()

      if (insertError) {
        console.error('Failed to create user:', insertError)
        return NextResponse.json(
          { error: 'Failed to create user profile: ' + insertError.message },
          { status: 500 }
        )
      }

      user = newUser
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
