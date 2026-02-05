// Subscription management utilities
// Note: Subscription tables are not in the current Prisma schema
// These functions provide fallback behavior for when subscriptions are not configured

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
  is_active: boolean
}

export interface Subscription {
  id: number
  organization_id: string
  plan_id: number
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
  trial_end_date: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  payment_provider: string | null
  payment_provider_subscription_id: string | null
  plan?: SubscriptionPlan
}

// Default plan for new organizations
const DEFAULT_PLAN: SubscriptionPlan = {
  id: 1,
  name: 'free',
  display_name: 'Free Plan',
  description: 'Free for small businesses',
  monthly_price: 0,
  yearly_price: 0,
  max_team_members: 3,
  max_products: 500,
  max_locations: 5,
  features: ['Unlimited inventory management', 'Up to 500 products', 'Up to 5 locations', 'Up to 3 team members', 'Email support'],
  is_active: true
}

export async function getOrganizationSubscription(_orgId: string): Promise<Subscription | null> {
  // Return a default subscription for now
  // In production, this would query the subscription tables
  return {
    id: 0,
    organization_id: _orgId,
    plan_id: 1,
    status: 'active',
    trial_end_date: null,
    current_period_start: new Date().toISOString(),
    current_period_end: null,
    cancel_at_period_end: false,
    payment_provider: null,
    payment_provider_subscription_id: null,
    plan: DEFAULT_PLAN
  }
}

export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  return [DEFAULT_PLAN]
}

export async function getPlanById(_planId: number): Promise<SubscriptionPlan | null> {
  return DEFAULT_PLAN
}

export async function getPlanByName(planName: string): Promise<SubscriptionPlan | null> {
  if (planName === 'free') return DEFAULT_PLAN
  return DEFAULT_PLAN
}

export async function updateSubscriptionPlan(_orgId: string, _planId: number): Promise<boolean> {
  return true
}

export async function cancelSubscription(_orgId: string): Promise<boolean> {
  return true
}

export function isTrialActive(subscription: Subscription | null): boolean {
  if (!subscription) return true
  if (subscription.status !== 'trial') return false
  if (!subscription.trial_end_date) return true
  return new Date(subscription.trial_end_date) > new Date()
}

export function getTrialDaysRemaining(subscription: Subscription | null): number {
  if (!subscription || !subscription.trial_end_date) return 30
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
  if (!subscription || !subscription.plan) return false

  const limits = {
    team_members: subscription.plan.max_team_members,
    products: subscription.plan.max_products,
    locations: subscription.plan.max_locations
  }

  const limit = limits[limitType]
  if (limit === -1) return false
  return currentCount >= limit
}

export function hasExceededAnyLimit(
  subscription: Subscription | null,
  usage: { teamMembers: number; products: number; locations: number }
): { exceeded: boolean; exceededLimits: string[] } {
  if (!subscription || !subscription.plan) {
    return { exceeded: false, exceededLimits: [] }
  }

  const exceededLimits: string[] = []

  if (subscription.plan.max_team_members !== -1 && usage.teamMembers >= subscription.plan.max_team_members) {
    exceededLimits.push('team_members')
  }

  if (subscription.plan.max_products !== -1 && usage.products >= subscription.plan.max_products) {
    exceededLimits.push('products')
  }

  if (subscription.plan.max_locations !== -1 && usage.locations >= subscription.plan.max_locations) {
    exceededLimits.push('locations')
  }

  return {
    exceeded: exceededLimits.length > 0,
    exceededLimits
  }
}

export function getUsagePercentage(
  subscription: Subscription | null,
  currentCount: number,
  limitType: 'team_members' | 'products' | 'locations'
): number {
  if (!subscription || !subscription.plan) return 0
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
  if (!subscription || !subscription.plan) return 999

  const limits = {
    team_members: subscription.plan.max_team_members,
    products: subscription.plan.max_products,
    locations: subscription.plan.max_locations
  }

  const limit = limits[limitType]
  if (limit === -1) return 999
  return Math.max(0, limit - currentCount)
}
