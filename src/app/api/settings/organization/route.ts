import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'
import { AuditService, AuditActions } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const org = db.prepare(`
      SELECT id, name, created_at, updated_at
      FROM organizations
      WHERE id = ?
    `).get(user.organization_id)

    const owner = db.prepare(`
      SELECT id, email, full_name
      FROM users
      WHERE id = (SELECT owner_id FROM organizations WHERE id = ?)
    `).get(user.organization_id) as any

    const memberCount = db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE organization_id = ?
    `).get(user.organization_id) as { count: number }

    return NextResponse.json({
      organization: org,
      owner,
      memberCount: memberCount.count
    })
  } catch (error) {
    console.error('Get organization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!PermissionsService.isOwner(user)) {
      return NextResponse.json({ error: 'Only owners can update organization' }, { status: 403 })
    }

    const body = await req.json()
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Organization name must be at least 2 characters' }, { status: 400 })
    }

    const currentOrg = db.prepare('SELECT name FROM organizations WHERE id = ?').get(user.organization_id) as { name: string }

    db.prepare(`
      UPDATE organizations
      SET name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name.trim(), user.organization_id)

    const updatedOrg = db.prepare(`
      SELECT id, name, created_at, updated_at
      FROM organizations
      WHERE id = ?
    `).get(user.organization_id)

    AuditService.logAction(
      user.id,
      user.organization_id,
      AuditActions.ORGANIZATION_UPDATED,
      'organization',
      user.organization_id,
      { name: currentOrg.name },
      { name: name.trim() }
    )

    return NextResponse.json({ organization: updatedOrg })
  } catch (error) {
    console.error('Update organization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
