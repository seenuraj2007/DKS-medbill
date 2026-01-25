import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription } from '@/lib/subscription'

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

    // Check if user has organization, if not and has products, create one
    if (!user.organization_id) {
      const { count: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (productCount && productCount > 0) {
        const orgName = user.full_name ? `${user.full_name}'s Organization` : 'My Organization'

        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({ name: orgName })
          .select()
          .single()

        if (!orgError && newOrg) {
          await supabase
            .from('users')
            .update({ organization_id: newOrg.id })
            .eq('id', user.id)

          const { data: freePlan } = await supabase
            .from('subscription_plans')
            .select('id')
            .eq('name', 'free')
            .single()

          if (freePlan) {
            const trialEndDate = new Date()
            trialEndDate.setDate(trialEndDate.getDate() + 14)

            await supabase
              .from('subscriptions')
              .insert({
                organization_id: newOrg.id,
                plan_id: freePlan.id,
                status: 'trial',
                trial_end_date: trialEndDate.toISOString()
              })
          }

          user.organization_id = newOrg.id
        }
      }
    }

    const [productsCount, productsData, alertsCount] = await Promise.all([
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('products')
        .select('id, current_quantity, reorder_point, name')
        .eq('user_id', user.id)
        .order('current_quantity', { ascending: true })
        .limit(20),
      supabase
        .from('alerts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    ])

    let teamMembersCount = 0
    let locationsCount = 0

    if (user.organization_id) {
      const [teamResult] = await Promise.all([
        supabase
          .from('organization_members')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', user.organization_id)
      ])
      teamMembersCount = teamResult.count || 0
    }

    // Count locations by user_id (not organization_id) - locations table doesn't have organization_id
    const locationsResult = await supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    locationsCount = locationsResult.count || 0

    const totalProducts = productsCount.count
    const allProducts = productsData.data || []
    const unreadAlerts = alertsCount.count

    const lowStockProductsCount = allProducts.filter((p: any) => p.current_quantity <= p.reorder_point && p.current_quantity > 0).length
    const outOfStockProductsCount = allProducts.filter((p: any) => p.current_quantity === 0).length
    const lowStockItems = allProducts
      .filter((p: any) => p.current_quantity <= p.reorder_point && p.current_quantity > 0)
      .slice(0, 5)

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
      subscription,
      usage: {
        teamMembers: teamMembersCount,
        products: totalProducts || 0,
        locations: locationsCount
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=30',
      }
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
