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

    const supabase = createServiceClient()

    const body = await req.json()
    const { quantity_change, change_type, notes } = body

    if (quantity_change === undefined || !change_type) {
      return NextResponse.json({ error: 'Quantity change and change type are required' }, { status: 400 })
    }

    if (!['add', 'remove', 'restock'].includes(change_type)) {
      return NextResponse.json({ error: 'Invalid change type' }, { status: 400 })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (productError || !product) {
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

    await supabase
      .from('products')
      .update({ current_quantity: newQuantity })
      .eq('id', id)

    const { error: historyError } = await supabase
      .from('stock_history')
      .insert({
        product_id: id,
        location_id: null,
        previous_quantity: previousQuantity,
        quantity_change: quantity_change,
        new_quantity: newQuantity,
        change_type,
        notes: notes || null
      })

    if (historyError) {
      console.error('Error creating stock history:', historyError)
    }

    const alerts: Array<{ id: string; product_id: string; alert_type: string; message: string }> = []

    if (newQuantity === 0) {
      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('product_id', id)
        .eq('alert_type', 'out_of_stock')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (!existingAlert) {
        const { data: alert } = await supabase
          .from('alerts')
          .insert({
            user_id: user.id,
            product_id: id,
            alert_type: 'out_of_stock',
            message: `Product "${product.name}" is out of stock! Current: 0`
          })
          .select()
          .single()

        if (alert) {
          alerts.push(alert)
        }
      }
    } else if (newQuantity <= product.reorder_point && newQuantity > 0) {
      const { data: existingAlert } = await supabase
        .from('alerts')
        .select('id')
        .eq('product_id', id)
        .eq('alert_type', 'low_stock')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (!existingAlert) {
        const { data: alert } = await supabase
          .from('alerts')
          .insert({
            user_id: user.id,
            product_id: id,
            alert_type: 'low_stock',
            message: `Low stock alert for "${product.name}": ${newQuantity} (reorder at ${product.reorder_point})`
          })
          .select()
          .single()

        if (alert) {
          alerts.push(alert)
        }
      }
    }

    const { data: updatedProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    return NextResponse.json({ product: updatedProduct, alerts })
  } catch (error) {
    console.error('Stock update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
