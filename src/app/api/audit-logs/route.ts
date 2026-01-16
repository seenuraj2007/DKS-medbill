import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'

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

    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        users (email, full_name)
      `, { count: 'exact' })
      .eq('organization_id', user.organization_id)

    if (actionFilter) {
      query = query.ilike('action', `%${actionFilter}%`)
    }

    if (typeFilter) {
      query = query.eq('resource_type', typeFilter)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: logs, error, count } = await query

    if (error) {
      console.error('Get audit logs error:', error)
      return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
    }

    const formattedLogs = (logs || []).map(log => ({
      id: log.id,
      action: log.action,
      resource_type: log.resource_type,
      resource_id: log.resource_id,
      old_value: log.old_value,
      new_value: log.new_value,
      ip_address: log.ip_address,
      created_at: log.created_at,
      user: log.users ? {
        email: log.users.email || '',
        full_name: log.users.full_name
      } : null
    }))

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
