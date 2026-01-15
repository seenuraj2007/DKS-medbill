import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription, hasReachedLimit } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = getOrganizationSubscription(user.organization_id)
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }

    const teamCount = db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE organization_id = ?
    `).get(user.organization_id) as { count: number }

    const productCount = db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE user_id IN (SELECT id FROM users WHERE organization_id = ?)
    `).get(user.organization_id) as { count: number }

    const locationCount = db.prepare(`
      SELECT COUNT(*) as count FROM locations WHERE user_id IN (SELECT id FROM users WHERE organization_id = ?)
    `).get(user.organization_id) as { count: number }

    const limits = {
      teamMembers: {
        current: teamCount.count,
        limit: subscription.plan?.max_team_members || -1,
        reached: hasReachedLimit(subscription, teamCount.count, 'team_members')
      },
      products: {
        current: productCount.count,
        limit: subscription.plan?.max_products || -1,
        reached: hasReachedLimit(subscription, productCount.count, 'products')
      },
      locations: {
        current: locationCount.count,
        limit: subscription.plan?.max_locations || -1,
        reached: hasReachedLimit(subscription, locationCount.count, 'locations')
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
