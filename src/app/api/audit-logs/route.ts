import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'

interface AuditLog {
  id: number
  user_id: number | null
  organization_id: number | null
  action: string
  resource_type: string
  resource_id: number | null
  old_value: string | null
  new_value: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user_email?: string
  user_full_name?: string | null
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!PermissionsService.isAdmin(user)) {
      return NextResponse.json({ error: 'Only admins can view audit logs' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    const actionFilter = searchParams.get('action')
    const typeFilter = searchParams.get('resource_type')

    let query = `
      SELECT al.*, u.email as user_email, u.full_name as user_full_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.organization_id = ?
    `
    const queryParams: unknown[] = [user.organization_id]

    if (actionFilter) {
      query += ' AND al.action LIKE ?'
      queryParams.push(`%${actionFilter}%`)
    }

    if (typeFilter) {
      query += ' AND al.resource_type = ?'
      queryParams.push(typeFilter)
    }

    query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?'
    queryParams.push(limit, offset)

    const logs = db.prepare(query).all(...queryParams) as AuditLog[]

    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      resource_type: log.resource_type,
      resource_id: log.resource_id,
      old_value: log.old_value,
      new_value: log.new_value,
      ip_address: log.ip_address,
      created_at: log.created_at,
      user: log.user_id ? {
        email: log.user_email || '',
        full_name: log.user_full_name
      } : null
    }))

    let countQuery = `
      SELECT COUNT(*) as count FROM audit_logs
      WHERE organization_id = ?
    `
    const countParams: unknown[] = [user.organization_id]

    if (actionFilter) {
      countQuery += ' AND action LIKE ?'
      countParams.push(`%${actionFilter}%`)
    }

    if (typeFilter) {
      countQuery += ' AND resource_type = ?'
      countParams.push(typeFilter)
    }

    const totalCount = db.prepare(countQuery).get(...countParams) as { count: number }

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit)
      }
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
