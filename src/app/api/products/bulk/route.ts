import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { operation, product_ids, data } = body

    if (!operation || !product_ids || !Array.isArray(product_ids)) {
      return NextResponse.json({ error: 'Operation and product_ids are required' }, { status: 400 })
    }

    if (product_ids.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 })
    }

    const validOperations = ['delete', 'update_stock', 'update_supplier', 'update_category', 'update_reorder']

    if (!validOperations.includes(operation)) {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
    }

    const results: any[] = []

    if (operation === 'delete') {
      for (const productId of product_ids) {
        try {
          db.prepare('DELETE FROM products WHERE id = ? AND user_id = ?').run(productId, user.id)
          results.push({ id: productId, success: true })
        } catch (error) {
          results.push({ id: productId, success: false, error: 'Failed to delete' })
        }
      }
    } else if (operation === 'update_stock') {
      const { change_type, quantity, notes } = data

      if (!quantity || !change_type || !['add', 'remove', 'restock'].includes(change_type)) {
        return NextResponse.json({ error: 'Invalid stock update data' }, { status: 400 })
      }

      const location = db.prepare('SELECT id FROM locations WHERE user_id = ? AND is_primary = 1').get(user.id) as any

      for (const productId of product_ids) {
        try {
          const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(productId, user.id) as any

          if (product) {
            const previousQuantity = product.current_quantity
            let newQuantity = previousQuantity

            if (change_type === 'add') {
              newQuantity += quantity
            } else if (change_type === 'remove') {
              newQuantity = Math.max(0, previousQuantity - quantity)
            } else if (change_type === 'restock') {
              newQuantity += quantity
            }

            db.prepare(`
              UPDATE products
              SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).run(newQuantity, productId)

            db.prepare(`
              INSERT INTO stock_history (product_id, location_id, previous_quantity, quantity_change, new_quantity, change_type, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(productId, location?.id || null, previousQuantity, change_type === 'remove' ? -quantity : quantity, newQuantity, change_type, notes || null)

            const productStock = db.prepare('SELECT * FROM product_stock WHERE product_id = ? AND location_id = ?').get(productId, location?.id) as any
            if (productStock) {
              const stockChange = change_type === 'remove' ? -quantity : quantity
              db.prepare(`
                UPDATE product_stock
                SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
                WHERE product_id = ? AND location_id = ?
              `).run(stockChange, productId, location?.id)
            } else if (location) {
              db.prepare(`
                INSERT INTO product_stock (product_id, location_id, quantity)
                VALUES (?, ?, ?)
              `).run(productId, location.id, newQuantity)
            }

            results.push({ id: productId, success: true, new_quantity: newQuantity })
          } else {
            results.push({ id: productId, success: false, error: 'Product not found' })
          }
        } catch (error) {
          results.push({ id: productId, success: false, error: 'Failed to update stock' })
        }
      }
    } else if (operation === 'update_supplier') {
      const { supplier_id } = data

      for (const productId of product_ids) {
        try {
          db.prepare(`
            UPDATE products
            SET supplier_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
          `).run(supplier_id || null, productId, user.id)
          results.push({ id: productId, success: true })
        } catch (error) {
          results.push({ id: productId, success: false, error: 'Failed to update supplier' })
        }
      }
    } else if (operation === 'update_category') {
      const { category } = data

      for (const productId of product_ids) {
        try {
          db.prepare(`
            UPDATE products
            SET category = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
          `).run(category || null, productId, user.id)
          results.push({ id: productId, success: true })
        } catch (error) {
          results.push({ id: productId, success: false, error: 'Failed to update category' })
        }
      }
    } else if (operation === 'update_reorder') {
      const { reorder_point } = data

      for (const productId of product_ids) {
        try {
          db.prepare(`
            UPDATE products
            SET reorder_point = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
          `).run(reorder_point || 0, productId, user.id)
          results.push({ id: productId, success: true })
        } catch (error) {
          results.push({ id: productId, success: false, error: 'Failed to update reorder point' })
        }
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
