import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: transfer, error } = await supabase
      .from('stock_transfers')
      .select(`
        *,
        from_location:locations!from_location_id (name),
        to_location:locations!to_location_id (name)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !transfer) {
      return NextResponse.json({ error: 'Stock transfer not found' }, { status: 404 })
    }

    const { data: items, error: itemsError } = await supabase
      .from('stock_transfer_items')
      .select(`
        *,
        products (name, sku)
      `)
      .eq('stock_transfer_id', id)

    return NextResponse.json({ 
      transfer: { 
        ...transfer, 
        from_location_name: transfer.from_location?.name,
        to_location_name: transfer.to_location?.name,
        items: items || [] 
      } 
    })
  } catch (error) {
    console.error('Get stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !['pending', 'in_transit', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: transfer, error: transferError } = await supabase
      .from('stock_transfers')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (transferError || !transfer) {
      return NextResponse.json({ error: 'Stock transfer not found' }, { status: 404 })
    }

    if (status === 'completed' && transfer.status !== 'in_transit') {
      return NextResponse.json({ error: 'Transfer must be in transit before completing' }, { status: 400 })
    }

    await supabase
      .from('stock_transfers')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)

    const { data: updatedTransfer } = await supabase
      .from('stock_transfers')
      .select(`
        *,
        from_location:locations!from_location_id (name),
        to_location:locations!to_location_id (name)
      `)
      .eq('id', id)
      .single()

    return NextResponse.json({ transfer: updatedTransfer })
  } catch (error) {
    console.error('Update stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: transfer, error: transferError } = await supabase
      .from('stock_transfers')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (transferError || !transfer) {
      return NextResponse.json({ error: 'Stock transfer not found' }, { status: 404 })
    }

    if (transfer.status === 'completed') {
      return NextResponse.json({ error: 'Cannot delete completed transfer' }, { status: 400 })
    }

    await supabase
      .from('stock_transfers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
