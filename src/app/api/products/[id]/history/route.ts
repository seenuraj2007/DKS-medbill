import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const { data: history, error: historyError } = await supabase
      .from('stock_history')
      .select(`
        *,
        locations (name)
      `)
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (historyError) {
      console.error('Error fetching stock history:', historyError)
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }

    const formattedHistory = (history || []).map(h => ({
      ...h,
      location_name: h.locations?.name || null
    }))

    return NextResponse.json({ history: formattedHistory })
  } catch (error) {
    console.error('Get stock history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
