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
    const category = searchParams.get('category')
    const supplier_id = searchParams.get('supplier_id')

    let query = 'SELECT * FROM products WHERE user_id = ?'
    const params: any[] = [user.id]

    if (category) {
      query += ' AND category = ?'
      params.push(category)
    }

    if (supplier_id) {
      query += ' AND supplier_id = ?'
      params.push(supplier_id)
    }

    query += ' ORDER BY created_at DESC'

    const products = db.prepare(query).all(...params) as any[]

    const productsWithAlerts = products.map(product => ({
      ...product,
      needs_restock: product.current_quantity <= product.reorder_point,
      is_out_of_stock: product.current_quantity === 0,
      profit_margin: product.selling_price > 0 ? ((product.selling_price - product.unit_cost) / product.selling_price * 100).toFixed(1) : 0
    }))

    return NextResponse.json({ products: productsWithAlerts })
  } catch (error) {
    console.error('Get products error:', error)
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
    const { 
      name, 
      sku, 
      barcode,
      category, 
      current_quantity, 
      reorder_point, 
      supplier_id,
      supplier_name, 
      supplier_email, 
      supplier_phone,
      unit_cost,
      selling_price,
      unit,
      image_url
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    const quantity = current_quantity ?? 0
    const reorderPoint = reorder_point ?? 0
    const cost = unit_cost ?? 0
    const price = selling_price ?? 0

    const result = db.prepare(`
      INSERT INTO products (user_id, name, sku, barcode, category, current_quantity, reorder_point, supplier_id, supplier_name, supplier_email, supplier_phone, unit_cost, selling_price, unit, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, name, sku || null, barcode || null, category || null, quantity, reorderPoint, supplier_id || null, supplier_name || null, supplier_email || null, supplier_phone || null, cost, price, unit || 'unit', image_url || null)

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)

    const location = db.prepare('SELECT id FROM locations WHERE user_id = ? AND is_primary = 1').get(user.id) as any
    if (location) {
      db.prepare(`
        INSERT INTO product_stock (product_id, location_id, quantity)
        VALUES (?, ?, ?)
      `).run(result.lastInsertRowid, location.id, quantity)
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
