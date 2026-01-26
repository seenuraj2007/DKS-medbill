import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'
import { getOrganizationSubscription, getAllPlans, getTrialDaysRemaining, isTrialActive } from '@/lib/subscription'
import { supabaseAdmin } from '@/lib/serverSupabase'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If user has no organization, check if they have products and auto-create organization
    if (!user.organization_id) {
      // Check if user has any products
      const { count: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (productCount && productCount > 0) {
        // User has products but no organization - auto-create one
        const orgName = user.full_name ? `${user.full_name}'s Organization` : 'My Organization'

        const { data: newOrg, error: orgError } = await (supabaseAdmin || supabase)
          .from('organizations')
          .insert({ name: orgName })
          .select()
          .single()

        if (orgError) {
          console.error('Error creating organization:', orgError)
        } else if (newOrg) {
          // Update user with organization_id
          const { error: updateError } = await (supabaseAdmin || supabase)
            .from('users')
            .update({ organization_id: newOrg.id })
            .eq('id', user.id)

          if (updateError) {
            console.error('Error updating user organization:', updateError)
          }

          // Create trial subscription for the new organization
          const { data: freePlan } = await (supabaseAdmin || supabase)
            .from('subscription_plans')
            .select('id')
            .eq('name', 'free')
            .single()

          if (freePlan) {
            const trialEndDate = new Date()
            trialEndDate.setDate(trialEndDate.getDate() + 14)

            await (supabaseAdmin || supabase)
              .from('subscriptions')
              .insert({
                organization_id: newOrg.id,
                plan_id: freePlan.id,
                status: 'trial',
                trial_end_date: trialEndDate.toISOString()
              })
          }

          // Redirect to fetch with new organization
          return NextResponse.json({ needsRefresh: true })
        }
      }

      const plans = await getAllPlans()
      return NextResponse.json({
        subscription: null,
        plans,
        usage: {
          teamMembers: 1,
          products: productCount || 0,
          locations: 0
        },
        trial: {
          isActive: true,
          daysRemaining: 14
        },
        needsOrganization: true
      })
    }

    // Allow any team member to view subscription
    // if (!PermissionsService.isOwner(user)) {
    //   return NextResponse.json({ error: 'Only owners can view subscription' }, { status: 403 })
    // }

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
