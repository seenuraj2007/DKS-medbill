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
    const status = searchParams.get('status')

    let query = `
      SELECT 
        st.*,
        l_from.name as from_location_name,
        l_to.name as to_location_name,
        COUNT(sti.id) as total_items
      FROM stock_transfers st
      JOIN locations l_from ON st.from_location_id = l_from.id
      JOIN locations l_to ON st.to_location_id = l_to.id
      WHERE st.user_id = ?
    `
    const params: any[] = [user.id]

    if (status) {
      query += ' AND st.status = ?'
      params.push(status)
    }

    query += ' GROUP BY st.id ORDER BY st.created_at DESC'

    const transfers = db.prepare(query).all(...params)

    return NextResponse.json({ transfers })
  } catch (error) {
    console.error('Get stock transfers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { from_location_id, to_location_id, items, notes } = body

    if (!from_location_id || !to_location_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'From location, to location, and items are required' }, { status: 400 })
    }

    if (from_location_id === to_location_id) {
      return NextResponse.json({ error: 'Source and destination locations cannot be the same' }, { status: 400 })
    }

    const fromLocation = db.prepare('SELECT * FROM locations WHERE id = ? AND user_id = ?').get(from_location_id, user.id)
    const toLocation = db.prepare('SELECT * FROM locations WHERE id = ? AND user_id = ?').get(to_location_id, user.id)

    if (!fromLocation || !toLocation) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    for (const item of items) {
      const productStock = db.prepare('SELECT * FROM product_stock WHERE product_id = ? AND location_id = ?').get(item.product_id, from_location_id) as any
      if (!productStock || productStock.quantity < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for product` }, { status: 400 })
      }
    }

    const result = db.prepare(`
      INSERT INTO stock_transfers (user_id, from_location_id, to_location_id, status, notes)
      VALUES (?, ?, ?, 'pending', ?)
    `).run(user.id, from_location_id, to_location_id, notes || null)

    const transferId = result.lastInsertRowid as number

    for (const item of items) {
      db.prepare(`
        INSERT INTO stock_transfer_items (stock_transfer_id, product_id, quantity)
        VALUES (?, ?, ?)
      `).run(transferId, item.product_id, item.quantity)
    }

    const transfer = db.prepare(`
      SELECT st.*, 
             l_from.name as from_location_name,
             l_to.name as to_location_name
      FROM stock_transfers st
      JOIN locations l_from ON st.from_location_id = l_from.id
      JOIN locations l_to ON st.to_location_id = l_to.id
      WHERE st.id = ?
    `).get(transferId)

    return NextResponse.json({ transfer }, { status: 201 })
  } catch (error) {
    console.error('Create stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
