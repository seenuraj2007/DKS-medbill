import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'
import { getOrganizationSubscription, getAllPlans, getTrialDaysRemaining, isTrialActive } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!PermissionsService.isOwner(user)) {
      return NextResponse.json({ error: 'Only owners can view subscription' }, { status: 403 })
    }

    const subscription = await getOrganizationSubscription(user.organization_id)
    const plans = await getAllPlans()

    const { count: teamCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)

    const { data: orgUsers } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', user.organization_id)

    const userIds = orgUsers?.map(u => u.id) || []

    const [productResult, locationResult] = await Promise.all([
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .in('user_id', userIds),
      supabase
        .from('locations')
        .select('id', { count: 'exact', head: true })
        .in('user_id', userIds)
    ])

    const productCount = productResult.count || 0
    const locationCount = locationResult.count || 0

    return NextResponse.json({
      subscription,
      plans,
      usage: {
        teamMembers: teamCount || 0,
        products: productCount || 0,
        locations: locationCount || 0
      },
      trial: {
        isActive: subscription ? isTrialActive(subscription) : false,
        daysRemaining: subscription ? getTrialDaysRemaining(subscription) : 0
      }
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Subscription management requires full implementation' }, { status: 501 })
}
