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

    const supabase = createServiceClient()

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

    const formattedHistory = (history || []).map((h: any) => ({
      ...h,
      location_name: h.locations?.name || null
    }))

    return NextResponse.json({ history: formattedHistory }, {
      headers: {
        'Cache-Control': 'private, max-age=10, stale-while-revalidate=30'
      }
    })
  } catch (error) {
    console.error('Get stock history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
