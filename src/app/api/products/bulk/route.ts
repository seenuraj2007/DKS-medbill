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

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

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

    const results: Array<{ id: string; success: boolean; error?: string; new_quantity?: number }> = []

    if (operation === 'delete') {
      for (const productId of product_ids) {
        try {
          const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId)
            .eq('user_id', user.id)

          results.push({ id: productId, success: !error, error: error ? 'Failed to delete' : undefined })
        } catch (error) {
          results.push({ id: productId, success: false, error: 'Failed to delete' })
        }
      }
    } else if (operation === 'update_stock') {
      const { change_type, quantity, notes } = data

      if (!quantity || !change_type || !['add', 'remove', 'restock'].includes(change_type)) {
        return NextResponse.json({ error: 'Invalid stock update data' }, { status: 400 })
      }

      const { data: locationData } = await supabase
        .from('locations')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single()

      for (const productId of product_ids) {
        try {
          const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .eq('user_id', user.id)
            .single()

          if (product) {
            const previousQuantity = product.current_quantity
            let newQuantity = previousQuantity

            if (change_type === 'add' || change_type === 'restock') {
              newQuantity += quantity
            } else if (change_type === 'remove') {
              newQuantity = Math.max(0, previousQuantity - quantity)
            }

            await supabase
              .from('products')
              .update({ current_quantity: newQuantity })
              .eq('id', productId)

            await supabase
              .from('stock_history')
              .insert({
                product_id: productId,
                location_id: locationData?.id || null,
                previous_quantity: previousQuantity,
                quantity_change: change_type === 'remove' ? -quantity : quantity,
                new_quantity: newQuantity,
                change_type,
                notes: notes || null
              })

            if (locationData) {
              const { data: productStock } = await supabase
                .from('product_stock')
                .select('*')
                .eq('product_id', productId)
                .eq('location_id', locationData.id)
                .single()

              if (productStock) {
                const stockChange = change_type === 'remove' ? -quantity : quantity
                await supabase
                  .from('product_stock')
                  .update({ quantity: productStock.quantity + stockChange })
                  .eq('product_id', productId)
                  .eq('location_id', locationData.id)
              } else {
                await supabase
                  .from('product_stock')
                  .insert({
                    product_id: productId,
                    location_id: locationData.id,
                    quantity: newQuantity
                  })
              }
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
          await supabase
            .from('products')
            .update({ supplier_id: supplier_id || null })
            .eq('id', productId)
            .eq('user_id', user.id)
          results.push({ id: productId, success: true })
        } catch (error) {
          results.push({ id: productId, success: false, error: 'Failed to update supplier' })
        }
      }
    } else if (operation === 'update_category') {
      const { category } = data

      for (const productId of product_ids) {
        try {
          await supabase
            .from('products')
            .update({ category: category || null })
            .eq('id', productId)
            .eq('user_id', user.id)
          results.push({ id: productId, success: true })
        } catch (error) {
          results.push({ id: productId, success: false, error: 'Failed to update category' })
        }
      }
    } else if (operation === 'update_reorder') {
      const { reorder_point } = data

      for (const productId of product_ids) {
        try {
          await supabase
            .from('products')
            .update({ reorder_point: reorder_point || 0 })
            .eq('id', productId)
            .eq('user_id', user.id)
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
