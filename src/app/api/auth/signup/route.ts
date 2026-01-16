import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { signupSchema } from '@/lib/validators'
import { handleApiError } from '@/lib/errorHandler'

export async function POST(req: NextRequest) {
  try {
    const validatedData = signupSchema.parse(await req.json())

    const orgName = validatedData.full_name ? `${validatedData.full_name}'s Organization` : 'My Organization'

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName })
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      throw new Error('Failed to create organization')
    }

    const orgId = orgData.id

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.full_name,
          organization_id: orgId
        }
      }
    })

    if (authError) {
      await supabase.from('organizations').delete().eq('id', orgId)
      if (authError.message.includes('already registered')) {
        throw new Error('Email already registered')
      }
      console.error('Auth signup error:', authError)
      throw new Error('Failed to create user')
    }

    if (!authData.user) {
      await supabase.from('organizations').delete().eq('id', orgId)
      throw new Error('Failed to create user')
    }

    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('name', 'free')
      .single()

    if (planData) {
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 30)

      await supabase.from('subscriptions').insert({
        organization_id: orgId,
        plan_id: planData.id,
        status: 'trial',
        trial_end_date: trialEndDate.toISOString()
      })
    }

    await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: validatedData.email,
        full_name: validatedData.full_name,
        organization_id: orgId,
        role: 'owner',
        status: 'active'
      })

    await supabase
      .from('organizations')
      .update({ owner_id: authData.user.id })
      .eq('id', orgId)

    await supabase
      .from('locations')
      .insert({
        user_id: authData.user.id,
        name: 'Default Location',
        address: 'Main warehouse',
        is_primary: true
      })

    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name, organization_id, role, status, created_at, updated_at')
      .eq('id', authData.user.id)
      .single()

    const response = NextResponse.json({ user }, { status: 201 })

    if (authData.session) {
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
    }

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return handleApiError(error)
  }
}
