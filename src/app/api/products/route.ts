import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription, hasReachedLimit } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const supplier_id = searchParams.get('supplier_id')

    let query = supabase.from('products').select('*').eq('user_id', user.id)

    if (category) {
      query = query.eq('category', category)
    }

    if (supplier_id) {
      query = query.eq('supplier_id', supplier_id)
    }

    query = query.order('created_at', { ascending: false })

    const { data: products, error } = await query

    if (error) {
      console.error('Get products error:', error)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    const productsWithAlerts = (products || []).map(product => ({
      ...product,
      needs_restock: product.current_quantity <= product.reorder_point,
      is_out_of_stock: product.current_quantity === 0,
      profit_margin: product.selling_price > 0 ? ((product.selling_price - product.unit_cost) / product.selling_price * 100).toFixed(1) : '0'
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

    if (user.organization_id) {
      const subscription = await getOrganizationSubscription(user.organization_id)
      if (subscription && subscription.status !== 'trial') {
        if (subscription.status === 'expired' || subscription.status === 'cancelled') {
          return NextResponse.json({ error: 'Subscription is not active' }, { status: 403 })
        }

        const { count, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (countError) {
          console.error('Error counting products:', countError)
        }

        if (count && hasReachedLimit(subscription, count, 'products')) {
          return NextResponse.json({
            error: 'Product limit reached',
            limit: subscription.plan?.max_products,
            current: count,
            upgradeUrl: '/subscription'
          }, { status: 403 })
        }
      }
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name,
        sku: sku || null,
        barcode: barcode || null,
        category: category || null,
        current_quantity: current_quantity ?? 0,
        reorder_point: reorder_point ?? 0,
        supplier_id: supplier_id || null,
        supplier_name: supplier_name || null,
        supplier_email: supplier_email || null,
        supplier_phone: supplier_phone || null,
        unit_cost: unit_cost ?? 0,
        selling_price: selling_price ?? 0,
        unit: unit || 'unit',
        image_url: image_url || null
      })
      .select()
      .single()

    if (productError || !product) {
      console.error('Create product error:', productError)
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    const { data: location } = await supabase
      .from('locations')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .single()

    if (location) {
      await supabase
        .from('product_stock')
        .insert({
          product_id: product.id,
          location_id: location.id,
          quantity: current_quantity ?? 0
        })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
