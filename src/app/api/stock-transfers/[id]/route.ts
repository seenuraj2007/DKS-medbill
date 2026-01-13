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

    const transfer = db.prepare(`
      SELECT st.*, 
             l_from.name as from_location_name,
             l_to.name as to_location_name
      FROM stock_transfers st
      JOIN locations l_from ON st.from_location_id = l_from.id
      JOIN locations l_to ON st.to_location_id = l_to.id
      WHERE st.id = ? AND st.user_id = ?
    `).get(id, user.id) as any

    if (!transfer) {
      return NextResponse.json({ error: 'Stock transfer not found' }, { status: 404 })
    }

    const items = db.prepare(`
      SELECT sti.*, p.name as product_name, p.sku as product_sku
      FROM stock_transfer_items sti
      JOIN products p ON sti.product_id = p.id
      WHERE sti.stock_transfer_id = ?
      ORDER BY sti.id
    `).all(id)

    return NextResponse.json({ transfer: { ...transfer, items } })
  } catch (error) {
    console.error('Get stock transfer error:', error)
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

    if (!status || !['pending', 'in_transit', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const transfer = db.prepare('SELECT * FROM stock_transfers WHERE id = ? AND user_id = ?').get(id, user.id) as any
    if (!transfer) {
      return NextResponse.json({ error: 'Stock transfer not found' }, { status: 404 })
    }

    if (status === 'completed' && transfer.status !== 'in_transit') {
      return NextResponse.json({ error: 'Transfer must be in transit before completing' }, { status: 400 })
    }

    if (status === 'completed') {
      const items = db.prepare('SELECT * FROM stock_transfer_items WHERE stock_transfer_id = ?').all(id) as any[]

      for (const item of items) {
        const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(item.product_id, user.id) as any

        if (product) {
          const fromStock = db.prepare('SELECT * FROM product_stock WHERE product_id = ? AND location_id = ?').get(item.product_id, transfer.from_location_id) as any
          const toStock = db.prepare('SELECT * FROM product_stock WHERE product_id = ? AND location_id = ?').get(item.product_id, transfer.to_location_id) as any

          if (!fromStock || fromStock.quantity < item.quantity) {
            return NextResponse.json({ 
              error: `Insufficient stock for product: ${product.name} (SKU: ${product.sku || 'N/A'}). Available: ${fromStock?.quantity || 0}, Requested: ${item.quantity}` 
            }, { status: 400 })
          }

          if (fromStock.quantity >= item.quantity) {
            db.prepare(`
              UPDATE product_stock
              SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
              WHERE product_id = ? AND location_id = ?
            `).run(item.quantity, item.product_id, transfer.from_location_id)

            db.prepare(`
              INSERT INTO stock_history (product_id, location_id, previous_quantity, quantity_change, new_quantity, change_type, notes, reference_id, reference_type)
              VALUES (?, ?, ?, ?, ?, 'transfer_out', ?, ?, 'stock_transfer')
            `).run(item.product_id, transfer.from_location_id, fromStock.quantity, -item.quantity, fromStock.quantity - item.quantity, `Transfer to location ${transfer.to_location_id}`, id)

            if (toStock) {
              db.prepare(`
                UPDATE product_stock
                SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
                WHERE product_id = ? AND location_id = ?
              `).run(item.quantity, item.product_id, transfer.to_location_id)

              db.prepare(`
                INSERT INTO stock_history (product_id, location_id, previous_quantity, quantity_change, new_quantity, change_type, notes, reference_id, reference_type)
                VALUES (?, ?, ?, ?, ?, 'transfer_in', ?, ?, 'stock_transfer')
              `).run(item.product_id, transfer.to_location_id, toStock.quantity, item.quantity, toStock.quantity + item.quantity, `Transfer from location ${transfer.from_location_id}`, id)
            } else {
              db.prepare(`
                INSERT INTO product_stock (product_id, location_id, quantity)
                VALUES (?, ?, ?)
              `).run(item.product_id, transfer.to_location_id, item.quantity)

              db.prepare(`
                INSERT INTO stock_history (product_id, location_id, previous_quantity, quantity_change, new_quantity, change_type, notes, reference_id, reference_type)
                VALUES (?, ?, 0, ?, ?, 'transfer_in', ?, ?, 'stock_transfer')
              `).run(item.product_id, transfer.to_location_id, item.quantity, item.quantity, `Transfer from location ${transfer.from_location_id}`, id)
            }
          }
        }
      }
    }

    db.prepare(`
      UPDATE stock_transfers
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(status, id, user.id)

    const updatedTransfer = db.prepare(`
      SELECT st.*, 
             l_from.name as from_location_name,
             l_to.name as to_location_name
      FROM stock_transfers st
      JOIN locations l_from ON st.from_location_id = l_from.id
      JOIN locations l_to ON st.to_location_id = l_to.id
      WHERE st.id = ?
    `).get(id)

    return NextResponse.json({ transfer: updatedTransfer })
  } catch (error) {
    console.error('Update stock transfer error:', error)
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

    const transfer = db.prepare('SELECT * FROM stock_transfers WHERE id = ? AND user_id = ?').get(id, user.id) as any
    if (!transfer) {
      return NextResponse.json({ error: 'Stock transfer not found' }, { status: 404 })
    }

    if (transfer.status === 'completed') {
      return NextResponse.json({ error: 'Cannot delete completed transfer' }, { status: 400 })
    }

    db.prepare('DELETE FROM stock_transfers WHERE id = ? AND user_id = ?').run(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
