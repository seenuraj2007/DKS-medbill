import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    let query = `
      SELECT a.*, p.name as product_name
      FROM alerts a
      JOIN products p ON a.product_id = p.id
      WHERE a.user_id = ?
    `
    const params: any[] = [user.id]

    if (unreadOnly) {
      query += ' AND a.is_read = 0'
    }

    query += ' ORDER BY a.created_at DESC LIMIT 50'

    const alerts = db.prepare(query).all(...params)

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { alert_ids, mark_as_read } = await req.json()

    if (!alert_ids || !Array.isArray(alert_ids) || alert_ids.length === 0) {
      return NextResponse.json({ error: 'Alert IDs are required' }, { status: 400 })
    }

    const placeholders = alert_ids.map(() => '?').join(',')
    const values = [...alert_ids, user.id]

    db.prepare(`
      UPDATE alerts
      SET is_read = ?
      WHERE id IN (${placeholders}) AND user_id = ?
    `).run(mark_as_read ? 1 : 0, ...values)

    return NextResponse.json({ message: 'Alerts updated successfully' })
  } catch (error) {
    console.error('Update alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
