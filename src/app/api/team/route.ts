import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { getOrganizationSubscription, hasReachedLimit } from '@/lib/subscription'
import { supabaseAdmin } from '@/lib/serverSupabase'
import { supabase } from '@/lib/supabase'

// GET /api/team - List team members
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: team, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, status, created_at')
      .eq('organization_id', user.organization_id)
      .order('created_at')

    if (error) {
      console.error('Error fetching team:', error)
      return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
    }

    return NextResponse.json({ team: team || [] })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/team/create-user - Create team member directly
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owner can create users
    if (!PermissionsService.isOwner(user)) {
      return NextResponse.json({ error: 'Only owners can create users' }, { status: 403 })
    }

    const body = await req.json()
    const { email, password, full_name, role } = body

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 })
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Check subscription limits
    if (!user.organization_id) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }
    const subscription = await getOrganizationSubscription(user.organization_id)
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }

    if (subscription.status === 'expired' || subscription.status === 'cancelled') {
      return NextResponse.json({ error: 'Subscription is not active' }, { status: 403 })
    }

    const { count: currentTeamCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)

    console.log('Team member limit check:', { 
      count: currentTeamCount, 
      maxLimit: subscription?.plan?.max_team_members,
      subscriptionStatus: subscription?.status,
      planName: subscription?.plan?.display_name || 'Free',
      planType: subscription?.plan?.name || 'free',
      orgId: user.organization_id
    })

    if (hasReachedLimit(subscription, currentTeamCount || 0, 'team_members')) {
      return NextResponse.json({
        error: 'Team member limit reached',
        limit: subscription.plan?.max_team_members,
        current: currentTeamCount,
        upgradeUrl: '/subscription'
      }, { status: 403 })
    }

    // Check if email already exists in organization
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('organization_id', user.organization_id)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists in organization' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        full_name: full_name || null,
        organization_id: user.organization_id,
        role,
        status: 'active',
        invited_by: user.id,
        invited_at: new Date().toISOString()
      })
      .select('id, email, full_name, role, status, created_at')
      .single()

    if (insertError) {
      console.error('Error creating user:', insertError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
