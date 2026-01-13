import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'
import { addHours } from 'date-fns'

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

    const pendingInvitations = db.prepare(`
      SELECT 
        id,
        email,
        role,
        status,
        created_at,
        expires_at
      FROM team_invitations
      WHERE organization_id = ? AND status = 'pending'
    `).all(user.organization_id)

    return NextResponse.json({ team, pendingInvitations })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/team/invite - Invite team member
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can invite (owner or admin)
    if (user.role !== 'owner' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await req.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Check if email already exists in organization
    const existingUser = db.prepare(`
      SELECT id, status
      FROM users
      WHERE email = ? AND organization_id = ?
    `).get(email, user.organization_id) as { id: number, status: string } | undefined

    if (existingUser) {
      return NextResponse.json({
        error: existingUser.status === 'pending'
          ? 'User already has a pending invitation'
          : 'User already in organization'
      }, { status: 400 })
    }

    // Check for existing pending invitation
    const existingInvitation: any = db.prepare(`
      SELECT id, expires_at, status
      FROM team_invitations
      WHERE email = ? AND organization_id = ?
    `).get(email, user.organization_id)

    if (existingInvitation && existingInvitation.status === 'pending') {
      // Update existing invitation if expired
      if (new Date(existingInvitation.expires_at) < new Date()) {
        const token = uuidv4()
        const expiresAt = addHours(new Date(), 48)

        db.prepare(`
          UPDATE team_invitations
          SET role = ?, token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(role, token, expiresAt.toISOString(), existingInvitation.id)
      } else {
        return NextResponse.json({ error: 'Invitation already sent' }, { status: 400 })
      }
    } else {
      // Create new invitation
      const token = uuidv4()
      const expiresAt = addHours(new Date(), 48)

      db.prepare(`
        INSERT INTO team_invitations (organization_id, email, role, invited_by, token, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(user.organization_id, email, role, user.id, token, expiresAt.toISOString())
    }

    const invitation = db.prepare(`
      SELECT 
        id,
        email,
        role,
        token,
        expires_at
      FROM team_invitations
      WHERE organization_id = ? AND email = ? AND status = 'pending'
    `).get(user.organization_id, email)

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error('Error inviting team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
