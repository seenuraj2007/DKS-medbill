import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { count: totalProducts } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { data: allProducts } = await supabase
      .from('products')
      .select('id, current_quantity, reorder_point, name')
      .eq('user_id', user.id)

    const productsList = allProducts || []

    const lowStockProductsCount = productsList.filter(p => p.current_quantity <= p.reorder_point && p.current_quantity > 0).length
    const outOfStockProductsCount = productsList.filter(p => p.current_quantity === 0).length
    const lowStockItems = productsList
      .filter(p => p.current_quantity <= p.reorder_point && p.current_quantity > 0)
      .sort((a, b) => a.current_quantity - b.current_quantity)
      .slice(0, 5)

    const { count: unreadAlerts } = await supabase
      .from('alerts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    let subscription = null
    if (user.organization_id) {
      const orgSubscription = await getOrganizationSubscription(user.organization_id)
      if (orgSubscription) {
        subscription = {
          status: orgSubscription.status,
          trial_end_date: orgSubscription.trial_end_date,
          plan: orgSubscription.plan ? {
            name: orgSubscription.plan.name,
            display_name: orgSubscription.plan.display_name,
            max_team_members: orgSubscription.plan.max_team_members,
            max_products: orgSubscription.plan.max_products,
            max_locations: orgSubscription.plan.max_locations
          } : undefined
        }
      }
    }

    return NextResponse.json({
      totalProducts: totalProducts || 0,
      lowStockProducts: lowStockProductsCount,
      outOfStockProducts: outOfStockProductsCount,
      unreadAlerts: unreadAlerts || 0,
      lowStockItems: lowStockItems || [],
      subscription
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
