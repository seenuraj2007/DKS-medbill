import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'
import { getOrganizationSubscription, getAllPlans, getTrialDaysRemaining, isTrialActive } from '@/lib/subscription'
import { AuditService, AuditActions } from '@/lib/audit'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!PermissionsService.isOwner(user)) {
      return NextResponse.json({ error: 'Only owners can view subscription' }, { status: 403 })
    }

    const subscription = getOrganizationSubscription(user.organization_id)
    const plans = getAllPlans()

    const teamCount = db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE organization_id = ?
    `).get(user.organization_id) as { count: number }

    const productCount = db.prepare(`
      SELECT COUNT(*) as count FROM products WHERE user_id IN (SELECT id FROM users WHERE organization_id = ?)
    `).get(user.organization_id) as { count: number }

    const locationCount = db.prepare(`
      SELECT COUNT(*) as count FROM locations WHERE user_id IN (SELECT id FROM users WHERE organization_id = ?)
    `).get(user.organization_id) as { count: number }

    return NextResponse.json({
      subscription,
      plans,
      usage: {
        teamMembers: teamCount.count,
        products: productCount.count,
        locations: locationCount.count
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
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!PermissionsService.isOwner(user)) {
      return NextResponse.json({ error: 'Only owners can manage subscription' }, { status: 403 })
    }

    const body = await req.json()
    const { planId, billingCycle } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    const plan = db.prepare('SELECT id, name, monthly_price, yearly_price FROM subscription_plans WHERE id = ? AND is_active = 1').get(planId) as any
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const subscription = getOrganizationSubscription(user.organization_id)
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }

    const isUpgrading = plan.monthly_price > (subscription.plan?.monthly_price || 0)
    const isTrial = subscription.status === 'trial'

    db.prepare('BEGIN TRANSACTION').run()

    if (isTrial) {
      db.prepare(`
        UPDATE subscriptions
        SET plan_id = ?, status = 'active', trial_end_date = NULL,
            current_period_start = CURRENT_TIMESTAMP,
            current_period_end = datetime(CURRENT_TIMESTAMP, '+1 month'),
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = ?
      `).run(planId, user.organization_id)
    } else {
      db.prepare(`
        UPDATE subscriptions
        SET plan_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = ?
      `).run(planId, user.organization_id)
    }

    db.prepare('COMMIT').run()

    const updatedSubscription = getOrganizationSubscription(user.organization_id)

    const action = isTrial ? 'trial_end' : (isUpgrading ? 'upgrade' : 'downgrade')
    AuditService.logAction(
      user.id,
      user.organization_id,
      AuditActions.SETTINGS_UPDATED,
      'organization',
      user.organization_id,
      { plan: subscription.plan?.name },
      { plan: plan.name }
    )

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: isTrial
        ? `Upgraded to ${plan.name} plan`
        : isUpgrading
          ? `Upgraded to ${plan.name} plan. Changes take effect immediately.`
          : `Downgraded to ${plan.name} plan. Changes take effect at the end of the billing period.`
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
