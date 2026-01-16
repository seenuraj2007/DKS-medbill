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
    const unreadOnly = searchParams.get('unread') === 'true'

    let query = supabase
      .from('alerts')
      .select(`
        *,
        products (name)
      `)
      .eq('user_id', user.id)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    query = query.order('created_at', { ascending: false }).limit(50)

    const { data: alerts, error } = await query

    if (error) {
      console.error('Get alerts error:', error)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    const formattedAlerts = (alerts || []).map(alert => ({
      ...alert,
      product_name: alert.products?.name || null
    }))

    return NextResponse.json({ alerts: formattedAlerts })
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { alert_ids, mark_as_read } = await req.json()

    if (!alert_ids || !Array.isArray(alert_ids) || alert_ids.length === 0) {
      return NextResponse.json({ error: 'Alert IDs are required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('alerts')
      .update({ is_read: mark_as_read })
      .in('id', alert_ids)
      .eq('user_id', user.id)

    if (error) {
      console.error('Update alerts error:', error)
      return NextResponse.json({ error: 'Failed to update alerts' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Alerts updated successfully' })
  } catch (error) {
    console.error('Update alerts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
