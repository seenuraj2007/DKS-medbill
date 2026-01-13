import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ? AND user_id = ?').get(id, user.id) as any

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
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

    const updates: string[] = []
    const values: any[] = []

    if (name !== undefined) { updates.push('name = ?'); values.push(name) }
    if (sku !== undefined) { updates.push('sku = ?'); values.push(sku || null) }
    if (barcode !== undefined) { updates.push('barcode = ?'); values.push(barcode || null) }
    if (category !== undefined) { updates.push('category = ?'); values.push(category || null) }
    if (current_quantity !== undefined) { updates.push('current_quantity = ?'); values.push(current_quantity) }
    if (reorder_point !== undefined) { updates.push('reorder_point = ?'); values.push(reorder_point) }
    if (supplier_id !== undefined) { updates.push('supplier_id = ?'); values.push(supplier_id || null) }
    if (supplier_name !== undefined) { updates.push('supplier_name = ?'); values.push(supplier_name || null) }
    if (supplier_email !== undefined) { updates.push('supplier_email = ?'); values.push(supplier_email || null) }
    if (supplier_phone !== undefined) { updates.push('supplier_phone = ?'); values.push(supplier_phone || null) }
    if (unit_cost !== undefined) { updates.push('unit_cost = ?'); values.push(unit_cost) }
    if (selling_price !== undefined) { updates.push('selling_price = ?'); values.push(selling_price) }
    if (unit !== undefined) { updates.push('unit = ?'); values.push(unit) }
    if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url || null) }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    values.push(id, user.id)

    db.prepare(`
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = ? AND user_id = ?
    `).run(...values)

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    db.prepare('DELETE FROM products WHERE id = ? AND user_id = ?').run(id, user.id)

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
