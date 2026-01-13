import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

function checkAndCreateAlerts(product: any, newQuantity: number) {
  const alerts: any[] = []

  if (newQuantity === 0) {
    const existingAlert = db.prepare(`
      SELECT id FROM alerts
      WHERE product_id = ? AND alert_type = 'out_of_stock' AND created_at > datetime('now', '-24 hours')
    `).get(product.id)

    if (!existingAlert) {
      const result = db.prepare(`
        INSERT INTO alerts (user_id, product_id, alert_type, message, is_sent)
        VALUES (?, ?, 'out_of_stock', ?, 0)
      `).run(product.user_id, product.id, `Product "${product.name}" is out of stock! Current: 0`)

      alerts.push({
        id: result.lastInsertRowid,
        product_id: product.id,
        alert_type: 'out_of_stock',
        message: `Product "${product.name}" is out of stock! Current: 0`
      })
    }
  } else if (newQuantity <= product.reorder_point && newQuantity > 0) {
    const existingAlert = db.prepare(`
      SELECT id FROM alerts
      WHERE product_id = ? AND alert_type = 'low_stock' AND created_at > datetime('now', '-24 hours')
    `).get(product.id)

    if (!existingAlert) {
      const result = db.prepare(`
        INSERT INTO alerts (user_id, product_id, alert_type, message, is_sent)
        VALUES (?, ?, 'low_stock', ?, 0)
      `).run(product.user_id, product.id, `Low stock alert for "${product.name}": ${newQuantity} (reorder at ${product.reorder_point})`)

      alerts.push({
        id: result.lastInsertRowid,
        product_id: product.id,
        alert_type: 'low_stock',
        message: `Low stock alert for "${product.name}": ${newQuantity} (reorder at ${product.reorder_point})`
      })
    }
  }

  return alerts
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { quantity_change, change_type, notes } = body

    if (quantity_change === undefined || !change_type) {
      return NextResponse.json({ error: 'Quantity change and change type are required' }, { status: 400 })
    }

    if (!['add', 'remove', 'restock'].includes(change_type)) {
      return NextResponse.json({ error: 'Invalid change type' }, { status: 400 })
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(id, user.id) as any

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const previousQuantity = product.current_quantity
    let newQuantity = previousQuantity

    if (change_type === 'add' || change_type === 'restock') {
      newQuantity = previousQuantity + Math.abs(quantity_change)
    } else if (change_type === 'remove') {
      newQuantity = previousQuantity - Math.abs(quantity_change)
      if (newQuantity < 0) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
      }
    }

    db.prepare('UPDATE products SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newQuantity, id)

    db.prepare(`
      INSERT INTO stock_history (product_id, location_id, previous_quantity, quantity_change, new_quantity, change_type, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, null, previousQuantity, quantity_change, newQuantity, change_type, notes || null)

    const alerts = checkAndCreateAlerts(product, newQuantity)

    const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id)

    return NextResponse.json({ product: updatedProduct, alerts })
  } catch (error) {
    console.error('Stock update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
