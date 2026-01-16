import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('stock_transfers')
      .select(`
        *,
        locations!from_location_id (name),
        locations!to_location_id (name),
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

    return NextResponse.json({ transfers: transfers || [] })
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
        locations!from_location_id (name),
        locations!to_location_id (name)
      `)
      .eq('id', transfer.id)
      .single()

    return NextResponse.json({ transfer: createdTransfer }, { status: 201 })
  } catch (error) {
    console.error('Create stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
