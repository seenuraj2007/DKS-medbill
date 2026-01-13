import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const history = db.prepare(`
      SELECT sh.*, l.name as location_name
      FROM stock_history sh
      LEFT JOIN locations l ON sh.location_id = l.id
      WHERE sh.product_id = ? AND sh.product_id IN (SELECT id FROM products WHERE user_id = ?)
      ORDER BY sh.created_at DESC
      LIMIT 50
    `).all(id, user.id) as any[]

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Get stock history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
