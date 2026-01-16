import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: location, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const { data: products, error: productsError } = await supabase
      .from('product_stock')
      .select(`
        *,
        products (*)
      `)
      .eq('location_id', id)
      .eq('products.user_id', user.id)

    if (productsError) {
      console.error('Get location products error:', productsError)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }

    const formattedProducts = (products || []).map(ps => ({
      ...ps.products,
      location_quantity: ps.quantity
    }))

    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error('Get location products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
