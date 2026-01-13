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

    const order = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ? AND po.user_id = ?
    `).get(id, user.id) as any

    if (!order) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    const items = db.prepare(`
      SELECT poi.*, p.name as product_name, p.sku as product_sku
      FROM purchase_order_items poi
      JOIN products p ON poi.product_id = p.id
      WHERE poi.purchase_order_id = ?
      ORDER BY poi.id
    `).all(id)

    return NextResponse.json({ order: { ...order, items } })
  } catch (error) {
    console.error('Get purchase order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !['pending', 'sent', 'received', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const order = db.prepare('SELECT * FROM purchase_orders WHERE id = ? AND user_id = ?').get(id, user.id) as any
    if (!order) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    if (status === 'received' && order.status !== 'sent') {
      return NextResponse.json({ error: 'Order must be sent before receiving' }, { status: 400 })
    }

    db.prepare(`
      UPDATE purchase_orders
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(status, id, user.id)

    if (status === 'received') {
      const items = db.prepare('SELECT * FROM purchase_order_items WHERE purchase_order_id = ?').all(id) as any[]

      const location = db.prepare('SELECT id FROM locations WHERE user_id = ? AND is_primary = 1').get(user.id) as any

      for (const item of items) {
        const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(item.product_id, user.id) as any

        if (product) {
          const newQuantity = product.current_quantity + item.quantity
          const previousQuantity = product.current_quantity

          db.prepare(`
            UPDATE products
            SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(newQuantity, item.product_id)

          db.prepare(`
            INSERT INTO stock_history (product_id, location_id, previous_quantity, quantity_change, new_quantity, change_type, notes, reference_id, reference_type)
            VALUES (?, ?, ?, ?, ?, 'restock', 'Purchase Order received', ?, 'purchase_order')
          `).run(item.product_id, location?.id || null, previousQuantity, item.quantity, newQuantity, id)

          db.prepare(`
            UPDATE purchase_order_items
            SET received_quantity = ?
            WHERE id = ?
          `).run(item.quantity, item.id)

          const productStock = db.prepare('SELECT * FROM product_stock WHERE product_id = ? AND location_id = ?').get(item.product_id, location?.id) as any
          if (productStock) {
            db.prepare(`
              UPDATE product_stock
              SET quantity = ?, updated_at = CURRENT_TIMESTAMP
              WHERE product_id = ? AND location_id = ?
            `).run(productStock.quantity + item.quantity, item.product_id, location?.id)
          } else if (location) {
            db.prepare(`
              INSERT INTO product_stock (product_id, location_id, quantity)
              VALUES (?, ?, ?)
            `).run(item.product_id, location.id, item.quantity)
          }
        }
      }
    }

    const updatedOrder = db.prepare(`
      SELECT po.*, s.name as supplier_name
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      WHERE po.id = ?
    `).get(id)

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error('Update purchase order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = db.prepare('SELECT * FROM purchase_orders WHERE id = ? AND user_id = ?').get(id, user.id) as any
    if (!order) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    if (order.status === 'received') {
      return NextResponse.json({ error: 'Cannot delete received order' }, { status: 400 })
    }

    db.prepare('DELETE FROM purchase_orders WHERE id = ? AND user_id = ?').run(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete purchase order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
