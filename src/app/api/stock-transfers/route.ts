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

    let query = supabase
      .from('stock_transfers')
      .select(`
        *,
        from_location:locations!from_location_id (name),
        to_location:locations!to_location_id (name),
        stock_transfer_items (count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: transfers, error } = await query

    if (error) {
      console.error('Get stock transfers error:', error)
      return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 })
    }

    return NextResponse.json({ transfers: transfers || [] }, {
      headers: {
        'Cache-Control': 'private, max-age=10, stale-while-revalidate=30'
      }
    })
  } catch (error) {
    console.error('Get stock transfers error:', error)
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
    const { from_location_id, to_location_id, items, notes } = body

    if (!from_location_id || !to_location_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'From location, to location, and items are required' }, { status: 400 })
    }

    if (from_location_id === to_location_id) {
      return NextResponse.json({ error: 'Source and destination locations cannot be the same' }, { status: 400 })
    }

    const { data: transfer, error } = await supabase
      .from('stock_transfers')
      .insert({
        user_id: user.id,
        from_location_id,
        to_location_id,
        status: 'pending',
        notes: notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Create stock transfer error:', error)
      return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 })
    }

    const transferItems = items.map((item: { product_id: string; quantity: number }) => ({
      stock_transfer_id: transfer.id,
      product_id: item.product_id,
      quantity: item.quantity
    }))

    if (transferItems.length > 0) {
      await supabase.from('stock_transfer_items').insert(transferItems)
    }

    const { data: createdTransfer } = await supabase
      .from('stock_transfers')
      .select(`
        *,
        from_location:locations!from_location_id (name),
        to_location:locations!to_location_id (name)
      `)
      .eq('id', transfer.id)
      .single()

    return NextResponse.json({ transfer: createdTransfer }, { status: 201 })
  } catch (error) {
    console.error('Create stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
