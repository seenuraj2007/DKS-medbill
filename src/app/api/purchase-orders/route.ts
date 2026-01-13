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
    const supplier_id = searchParams.get('supplier_id')

    let query = `
      SELECT 
        po.*,
        s.name as supplier_name,
        COUNT(poi.id) as total_items
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.user_id = ?
    `
    const params: any[] = [user.id]

    if (status) {
      query += ' AND po.status = ?'
      params.push(status)
    }

    if (supplier_id) {
      query += ' AND po.supplier_id = ?'
      params.push(supplier_id)
    }

    query += ' GROUP BY po.id ORDER BY po.created_at DESC'

    const orders = db.prepare(query).all(...params)

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Get purchase orders error:', error)
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
    const { supplier_id, items, notes } = body

    if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Supplier and items are required' }, { status: 400 })
    }

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ? AND user_id = ?').get(supplier_id, user.id) as any
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const totalCost = items.reduce((sum: number, item: any) => sum + (item.unit_cost * item.quantity), 0)

    const orderNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const result = db.prepare(`
      INSERT INTO purchase_orders (user_id, supplier_id, order_number, status, total_cost, notes)
      VALUES (?, ?, ?, 'pending', ?, ?)
    `).run(user.id, supplier_id, orderNumber, totalCost, notes || null)

    const orderId = result.lastInsertRowid as number

    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(item.product_id, user.id)
      if (!product) {
        continue
      }

      const itemTotalCost = item.unit_cost * item.quantity

      db.prepare(`
        INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_cost, total_cost)
        VALUES (?, ?, ?, ?, ?)
      `).run(orderId, item.product_id, item.quantity, item.unit_cost, itemTotalCost)
    }

    const order = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ?
    `).get(orderId)

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Create purchase order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
