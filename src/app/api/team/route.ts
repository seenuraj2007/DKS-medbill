import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'
import bcrypt from 'bcryptjs'
import { getOrganizationSubscription, hasReachedLimit } from '@/lib/subscription'
import { AuditService, AuditActions } from '@/lib/audit'

// GET /api/team - List team members
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const team = db.prepare(`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.status,
        u.created_at
      FROM users u
      WHERE u.organization_id = ?
      ORDER BY u.created_at ASC
    `).all(user.organization_id)

    return NextResponse.json({ team })
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
    const subscription = getOrganizationSubscription(user.organization_id)
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }

    if (subscription.status === 'expired' || subscription.status === 'cancelled') {
      return NextResponse.json({ error: 'Subscription is not active' }, { status: 403 })
    }

    const currentTeamCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE organization_id = ?').get(user.organization_id) as { count: number }

    if (hasReachedLimit(subscription, currentTeamCount.count, 'team_members')) {
      return NextResponse.json({
        error: 'Team member limit reached',
        limit: subscription.plan?.max_team_members,
        current: currentTeamCount.count,
        upgradeUrl: '/subscription'
      }, { status: 403 })
    }

    // Check if email already exists in organization
    const existingUser = db.prepare(`
      SELECT id
      FROM users
      WHERE email = ? AND organization_id = ?
    `).get(email, user.organization_id) as { id: number } | undefined

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists in organization' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = db.prepare(`
      INSERT INTO users (email, password, full_name, organization_id, role, status, invited_by, invited_at)
      VALUES (?, ?, ?, ?, ?, 'active', ?, CURRENT_TIMESTAMP)
    `).run(email, hashedPassword, full_name || null, user.organization_id, role, user.id)

    const newUser = db.prepare(`
      SELECT id, email, full_name, role, status, created_at
      FROM users
      WHERE id = ?
    `).get(result.lastInsertRowid)

    AuditService.logAction(
      user.id,
      user.organization_id,
      AuditActions.USER_CREATED,
      'user',
      Number(result.lastInsertRowid),
      null,
      { email, full_name, role }
    )

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
