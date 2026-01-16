import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription, hasReachedLimit } from '@/lib/subscription'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await getOrganizationSubscription(user.organization_id)
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }

    const teamResult = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)

    const teamCount = teamResult.count || 0

    const { data: orgUsers } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', user.organization_id)

    const userIds = orgUsers?.map(u => u.id) || []

    const [productResult, locationResult] = await Promise.all([
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .in('user_id', userIds),
      supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .in('user_id', userIds)
    ])

    const productCount = productResult.count || 0
    const locationCount = locationResult.count || 0

    const limits = {
      teamMembers: {
        current: teamCount,
        limit: subscription.plan?.max_team_members || -1,
        reached: hasReachedLimit(subscription, teamCount, 'team_members')
      },
      products: {
        current: productCount,
        limit: subscription.plan?.max_products || -1,
        reached: hasReachedLimit(subscription, productCount, 'products')
      },
      locations: {
        current: locationCount,
        limit: subscription.plan?.max_locations || -1,
        reached: hasReachedLimit(subscription, locationCount, 'locations')
      }
    }

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan
      },
      limits
    })
  } catch (error) {
    console.error('Error checking usage:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
