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

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ? AND user_id = ?').get(id, user.id)
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const products = db.prepare(`
      SELECT * FROM products
      WHERE supplier_id = ? AND user_id = ?
      ORDER BY name
    `).all(id, user.id)

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Get supplier products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
