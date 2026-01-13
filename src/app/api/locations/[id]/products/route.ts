import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const location = db.prepare('SELECT * FROM locations WHERE id = ? AND user_id = ?').get(id, user.id)
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const products = db.prepare(`
      SELECT p.*, ps.quantity as location_quantity
      FROM products p
      INNER JOIN product_stock ps ON p.id = ps.product_id
      WHERE ps.location_id = ? AND p.user_id = ?
      ORDER BY p.name
    `).all(id, user.id)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Get location products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
