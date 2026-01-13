import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const location = db.prepare('SELECT * FROM locations WHERE id = ? AND user_id = ?').get(id, user.id)
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM product_stock WHERE location_id = ?').get(id) as any

    return NextResponse.json({ location: { ...location, total_products: totalProducts?.count || 0 } })
  } catch (error) {
    console.error('Get location error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, address, city, state, zip, country, is_primary } = body

    if (!name) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 })
    }

    const existing = db.prepare('SELECT * FROM locations WHERE id = ? AND user_id = ?').get(id, user.id)
    if (!existing) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (is_primary) {
      db.prepare('UPDATE locations SET is_primary = 0 WHERE user_id = ?').run(user.id)
    }

    db.prepare(`
      UPDATE locations
      SET name = ?, address = ?, city = ?, state = ?, zip = ?, country = ?, is_primary = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(name, address || null, city || null, state || null, zip || null, country || null, is_primary ? 1 : 0, id, user.id)

    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(id)

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Update location error:', error)
    if ((error as any).code === 'SQLITE_CONSTRAINT') {
      return NextResponse.json({ error: 'Location name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const location = db.prepare('SELECT * FROM locations WHERE id = ? AND user_id = ?').get(id, user.id) as any
    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (location.is_primary) {
      const otherLocations = db.prepare('SELECT id FROM locations WHERE user_id = ? AND id != ?').all(user.id, id)
      if (otherLocations.length === 0) {
        return NextResponse.json({ error: 'Cannot delete only location' }, { status: 400 })
      }
    }

    db.prepare('DELETE FROM locations WHERE id = ? AND user_id = ?').run(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete location error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
