import db from './db'

export interface SubscriptionPlan {
  id: number
  name: string
  display_name: string
  description: string | null
  monthly_price: number
  yearly_price: number
  max_team_members: number
  max_products: number
  max_locations: number
  features: string[]
  is_active: number
}

export interface Subscription {
  id: number
  organization_id: number
  plan_id: number
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
  trial_end_date: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: number
  payment_provider: string | null
  payment_provider_subscription_id: string | null
  plan?: SubscriptionPlan
}

export function getOrganizationSubscription(orgId: number): Subscription | null {
  const subscription = db.prepare(`
    SELECT s.*, sp.name as plan_name, sp.display_name, sp.description,
           sp.monthly_price, sp.yearly_price, sp.max_team_members,
           sp.max_products, sp.max_locations, sp.features, sp.is_active
    FROM subscriptions s
    JOIN subscription_plans sp ON s.plan_id = sp.id
    WHERE s.organization_id = ?
    ORDER BY s.created_at DESC
    LIMIT 1
  `).get(orgId) as any

  if (!subscription) return null

  return {
    ...subscription,
    plan: {
      id: subscription.plan_id,
      name: subscription.plan_name,
      display_name: subscription.display_name,
      description: subscription.description,
      monthly_price: subscription.monthly_price,
      yearly_price: subscription.yearly_price,
      max_team_members: subscription.max_team_members,
      max_products: subscription.max_products,
      max_locations: subscription.max_locations,
      features: JSON.parse(subscription.features || '[]'),
      is_active: subscription.is_active
    }
  }
}

export function getAllPlans(): SubscriptionPlan[] {
  const plans = db.prepare(`
    SELECT id, name, display_name, description, monthly_price, yearly_price,
           max_team_members, max_products, max_locations, features, is_active
    FROM subscription_plans
    WHERE is_active = 1
    ORDER BY monthly_price ASC
  `).all() as any[]

  return plans.map(plan => ({
    ...plan,
    features: JSON.parse(plan.features || '[]')
  }))
}

export function getPlanById(planId: number): SubscriptionPlan | null {
  const plan = db.prepare(`
    SELECT id, name, display_name, description, monthly_price, yearly_price,
           max_team_members, max_products, max_locations, features, is_active
    FROM subscription_plans
    WHERE id = ?
  `).get(planId) as any

  if (!plan) return null

  return {
    ...plan,
    features: JSON.parse(plan.features || '[]')
  }
}

export function getPlanByName(planName: string): SubscriptionPlan | null {
  const plan = db.prepare(`
    SELECT id, name, display_name, description, monthly_price, yearly_price,
           max_team_members, max_products, max_locations, features, is_active
    FROM subscription_plans
    WHERE name = ?
  `).get(planName) as any

  if (!plan) return null

  return {
    ...plan,
    features: JSON.parse(plan.features || '[]')
  }
}

export function updateSubscriptionPlan(orgId: number, planId: number): boolean {
  try {
    db.prepare(`
      UPDATE subscriptions
      SET plan_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE organization_id = ?
    `).run(planId, orgId)
    return true
  } catch (error) {
    console.error('Error updating subscription plan:', error)
    return false
  }
}

export function cancelSubscription(orgId: number): boolean {
  try {
    db.prepare(`
      UPDATE subscriptions
      SET status = 'cancelled', cancel_at_period_end = 0, updated_at = CURRENT_TIMESTAMP
      WHERE organization_id = ?
    `).run(orgId)
    return true
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return false
  }
}

export function isTrialActive(subscription: Subscription | null): boolean {
  if (!subscription) return false
  if (subscription.status !== 'trial') return false
  if (!subscription.trial_end_date) return false
  return new Date(subscription.trial_end_date) > new Date()
}

export function getTrialDaysRemaining(subscription: Subscription | null): number {
  if (!subscription || !subscription.trial_end_date) return 0
  const now = new Date()
  const end = new Date(subscription.trial_end_date)
  const diff = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function hasReachedLimit(
  subscription: Subscription | null,
  currentCount: number,
  limitType: 'team_members' | 'products' | 'locations'
): boolean {
  if (!subscription) return true
  if (!subscription.plan) return false

  const limits = {
    team_members: subscription.plan.max_team_members,
    products: subscription.plan.max_products,
    locations: subscription.plan.max_locations
  }

  const limit = limits[limitType]
  if (limit === -1) return false
  return currentCount >= limit
}

export function getUsagePercentage(
  subscription: Subscription | null,
  currentCount: number,
  limitType: 'team_members' | 'products' | 'locations'
): number {
  if (!subscription || !subscription.plan) return 100
  if (currentCount === 0) return 0

  const limits = {
    team_members: subscription.plan.max_team_members,
    products: subscription.plan.max_products,
    locations: subscription.plan.max_locations
  }

  const limit = limits[limitType]
  if (limit === -1) return 0
  return Math.min(100, Math.round((currentCount / limit) * 100))
}

export function getRemainingAllowed(
  subscription: Subscription | null,
  currentCount: number,
  limitType: 'team_members' | 'products' | 'locations'
): number {
  if (!subscription || !subscription.plan) return 0

  const limits = {
    team_members: subscription.plan.max_team_members,
    products: subscription.plan.max_products,
    locations: subscription.plan.max_locations
  }

  const limit = limits[limitType]
  if (limit === -1) return -1
  return Math.max(0, limit - currentCount)
}
