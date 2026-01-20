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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const supplier_id = searchParams.get('supplier_id')

    let query = supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (name),
        purchase_order_items (count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (supplier_id) {
      query = query.eq('supplier_id', supplier_id)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Get purchase orders error:', error)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] }, {
      headers: {
        'Cache-Control': 'private, max-age=10, stale-while-revalidate=30'
      }
    })
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

    const supabase = createServiceClient()

    const body = await req.json()
    const { supplier_id, items, notes } = body

    if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Supplier and items are required' }, { status: 400 })
    }

    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', supplier_id)
      .eq('user_id', user.id)
      .single()

    if (supplierError || !supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const totalCost = items.reduce((sum: number, item: { unit_cost: number; quantity: number }) => sum + (item.unit_cost * item.quantity), 0)
    const orderNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .insert({
        user_id: user.id,
        supplier_id,
        order_number: orderNumber,
        status: 'pending',
        total_cost: totalCost,
        notes: notes || null
      })
      .select()
      .single()

    if (orderError) {
      console.error('Create order error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const orderItems = items
      .filter((item: { product_id?: string }) => item.product_id)
      .map((item: { product_id: string; quantity: number; unit_cost: number }) => ({
        purchase_order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.unit_cost * item.quantity
      }))

    if (orderItems.length > 0) {
      await supabase.from('purchase_order_items').insert(orderItems)
    }

    const { data: createdOrder } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (name)
      `)
      .eq('id', order.id)
      .single()

    return NextResponse.json({ order: createdOrder }, { status: 201 })
  } catch (error) {
    console.error('Create purchase order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
