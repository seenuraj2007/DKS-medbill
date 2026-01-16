import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', user.organization_id!)
      .single()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
        organization_id: user.organization_id,
        created_at: user.created_at,
        organization: org
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { full_name, current_password, new_password } = body

    if (full_name !== undefined) {
      await supabase
        .from('users')
        .update({ full_name: full_name || null })
        .eq('id', user.id)
    }

    if (current_password && new_password) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single()

      if (userError || !userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const validPassword = await bcrypt.compare(current_password, userData.password)
      
      if (!validPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      if (new_password.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(new_password, 10)
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password: new_password
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
      }
    }

    const { data: updatedUser } = await supabase
      .from('users')
      .select('id, email, full_name, role, status, organization_id, created_at')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
