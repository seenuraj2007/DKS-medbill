import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromRequest } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function createServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

function generateOrderNumber(): string {
  const date = new Date()
  const timestamp = date.getTime().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `POS-${timestamp}-${random}`
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: sales, error } = await supabase
      .from('sales')
      .select(`
        *,
        customers (name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching sales:', error)
      return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
    }

    return NextResponse.json({ sales: sales || [] })
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const body = await req.json()
    const { customer_id, items, notes } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in the sale' }, { status: 400 })
    }

    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.unit_price * item.quantity), 0
    )
    const totalDiscount = items.reduce((sum: number, item: any) => 
      sum + (item.discount || 0), 0
    )
    const total = subtotal - totalDiscount

    const orderNumber = generateOrderNumber()

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: user.id,
        organization_id: user.organization_id || null,
        customer_id: customer_id || null,
        order_number: orderNumber,
        status: 'completed',
        subtotal,
        tax: 0,
        discount: totalDiscount,
        total,
        notes: notes || null
      })
      .select()
      .single()

    if (saleError) {
      console.error('Create sale error:', saleError)
      return NextResponse.json({ error: 'Failed to create sale', details: saleError.message }, { status: 500 })
    }

    const saleItems = items.map((item: any) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount || 0,
      total: (item.unit_price * item.quantity) - (item.discount || 0)
    }))

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems)

    if (itemsError) {
      console.error('Create sale items error:', itemsError)
      await supabase.from('sales').delete().eq('id', sale.id)
      return NextResponse.json({ error: 'Failed to create sale items', details: itemsError.message }, { status: 500 })
    }

    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('id, current_quantity, name')
        .eq('id', item.product_id)
        .single()

      if (product) {
        const newQuantity = Math.max(0, product.current_quantity - item.quantity)
        await supabase
          .from('products')
          .update({ current_quantity: newQuantity })
          .eq('id', item.product_id)

        await supabase
          .from('stock_history')
          .insert({
            product_id: item.product_id,
            previous_quantity: product.current_quantity,
            quantity_change: -item.quantity,
            new_quantity: newQuantity,
            change_type: 'remove',
            notes: `POS Sale: ${orderNumber}`
          })
      }
    }

    const { data: updatedSale } = await supabase
      .from('sales')
      .select(`
        *,
        customers (name, email)
      `)
      .eq('id', sale.id)
      .single()

    return NextResponse.json({ 
      sale: updatedSale,
      message: 'Sale completed successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
