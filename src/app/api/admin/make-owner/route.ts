import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .update({ role: 'owner' })
      .eq('email', email)
      .select()
      .single()

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Role updated successfully',
      user: data 
    })
  } catch (error) {
    console.error('Error in make-owner route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
