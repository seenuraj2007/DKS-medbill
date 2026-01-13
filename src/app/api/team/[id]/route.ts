import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'

// PATCH /api/team/[id] - Update team member role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const memberId = parseInt(resolvedParams.id)
    const body = await req.json()
    const { role } = body

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user can manage team
    if (!PermissionsService.canInviteTeam(user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get team member to update
    const targetMember = db.prepare(`
      SELECT id, role, email, organization_id
      FROM users
      WHERE id = ?
    `).get(memberId) as { id: number, role: string, email: string, organization_id: number } | undefined

    if (!targetMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Verify team member belongs to same organization
    if (targetMember.organization_id !== user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Owner cannot change their own role
    if (targetMember.id === user.id && user.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
    }

    // Only owner can change owner role
    if (role === 'owner' && user.role !== 'owner') {
      return NextResponse.json({ error: 'Only owner can assign owner role' }, { status: 403 })
    }

    // Update role
    db.prepare(`
      UPDATE users
      SET role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(role, memberId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/team/[id] - Remove team member
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const memberId = parseInt(resolvedParams.id)

    // Check if user can manage team
    if (!PermissionsService.canManageUsers(user)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get team member to remove
    const targetMember = db.prepare(`
      SELECT id, role, email, organization_id
      FROM users
      WHERE id = ?
    `).get(memberId) as { id: number, role: string, email: string, organization_id: number } | undefined

    if (!targetMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Verify team member belongs to same organization
    if (targetMember.organization_id !== user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Owner cannot remove themselves
    if (targetMember.id === user.id && user.role === 'owner') {
      return NextResponse.json({ error: 'Owner cannot leave organization' }, { status: 400 })
    }

    // If removing owner, require organization transfer
    if (targetMember.role === 'owner') {
      return NextResponse.json({ error: 'Transfer ownership before removing' }, { status: 400 })
    }

    // Remove team member (set organization_id to null, keep user account)
    db.prepare(`
      UPDATE users
      SET organization_id = NULL, role = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(memberId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
