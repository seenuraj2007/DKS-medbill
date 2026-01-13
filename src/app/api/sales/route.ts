import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// POST /api/sales - Create new sale
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { customer_id, items, payment_method, payment_status, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Sale items are required' }, { status: 400 })
    }

    // Validate items
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        return NextResponse.json({ error: 'Invalid item data' }, { status: 400 })
      }
    }

    // Generate sale number
    const saleNumber = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Calculate totals
    let subtotal = 0
    let totalCOGS = 0

    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price
      const discount = item.discount || 0
      subtotal += (itemTotal - discount)
      
      // Get product cost for COGS
      const product = db.prepare('SELECT unit_cost FROM products WHERE id = ?').get(item.product_id) as any
      const cost = product?.unit_cost || 0
      totalCOGS += (cost * item.quantity)
    }

    const taxAmount = 0 // TODO: Add tax calculation
    const discountAmount = 0 // TODO: Add sale-level discount
    const total = subtotal + taxAmount - discountAmount

    // Create sale
    const saleResult = db.prepare(`
      INSERT INTO sales (user_id, organization_id, customer_id, sale_number, sale_date, 
                        subtotal, tax_amount, discount_amount, total, payment_method, payment_status, notes)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      user.id,
      user.organization_id,
      customer_id || null,
      saleNumber,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      payment_method || null,
      payment_status || 'paid',
      notes || null
    )

    const saleId = saleResult.lastInsertRowid as number

    // Create sale items and update stock
    for (const item of items) {
      const itemTotal = item.quantity * item.unit_price
      const discount = item.discount || 0
      const finalPrice = itemTotal - discount

      const product = db.prepare('SELECT unit_cost, current_quantity, name FROM products WHERE id = ?').get(item.product_id) as any
      
      // Create sale item
      db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, total_price, cost_of_goods)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(saleId, item.product_id, item.quantity, item.unit_price, discount, finalPrice, product?.unit_cost || 0)

      // Update product stock
      if (product) {
        const newQuantity = Math.max(0, product.current_quantity - item.quantity)
        db.prepare(`
          UPDATE products
          SET current_quantity = ?, revenue = COALESCE(revenue, 0) + ?, 
              total_cost_sold = COALESCE(total_cost_sold, 0) + ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(newQuantity, finalPrice, (product?.unit_cost || 0) * item.quantity, item.product_id)

        // Add to stock history
        db.prepare(`
          INSERT INTO stock_history (product_id, previous_quantity, quantity_change, new_quantity, 
                                change_type, notes, user_id, reference_id, reference_type)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          item.product_id,
          product.current_quantity,
          -item.quantity,
          newQuantity,
          'remove',
          `Sale #${saleNumber}`,
          user.id,
          saleId,
          'sale'
        )
      }
    }

    // Fetch created sale with items
    const sale: any = db.prepare(`
      SELECT s.*, c.name as customer_name, c.email as customer_email
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = ?
    `).get(saleId)

    const saleItems = db.prepare(`
      SELECT si.*, p.name as product_name, p.sku as product_sku
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `).all(saleId)

    const responseData = {
      sale: { ...sale, items: saleItems }
    }
    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/sales - List sales
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const customerId = searchParams.get('customer_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = `
      SELECT s.*, c.name as customer_name
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.organization_id = ?
    `
    const params: any[] = [user.organization_id]

    if (customerId) {
      query += ' AND s.customer_id = ?'
      params.push(customerId)
    }

    if (startDate) {
      query += ' AND s.sale_date >= ?'
      params.push(startDate)
    }

    if (endDate) {
      query += ' AND s.sale_date <= ?'
      params.push(endDate)
    }

    query += ' ORDER BY s.sale_date DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const sales = db.prepare(query).all(...params)

    return NextResponse.json({ sales })
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
