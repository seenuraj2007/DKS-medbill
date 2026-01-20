import { supabase } from './supabase'

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

export async function getOrganizationSubscription(orgId: string): Promise<Subscription | null> {
  const { data: subscriptionData, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      subscription_plans (
        name,
        display_name,
        description,
        monthly_price,
        yearly_price,
        max_team_members,
        max_products,
        max_locations,
        features,
        is_active
      )
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !subscriptionData) return null

  const plan = subscriptionData.subscription_plans as SubscriptionPlan
  const subscription = subscriptionData as { id: number; organization_id: string; plan_id: number; status: string; trial_end_date: string | null; current_period_start: string | null; current_period_end: string | null; cancel_at_period_end: boolean; payment_provider: string | null; payment_provider_subscription_id: string | null }

  return {
    id: subscription.id,
    organization_id: subscription.organization_id,
    plan_id: subscription.plan_id,
    status: subscription.status as 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired',
    trial_end_date: subscription.trial_end_date,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    cancel_at_period_end: subscription.cancel_at_period_end,
    payment_provider: subscription.payment_provider,
    payment_provider_subscription_id: subscription.payment_provider_subscription_id,
    plan: plan ? {
      id: subscription.plan_id,
      name: plan.name,
      display_name: plan.display_name,
      description: plan.description,
      monthly_price: plan.monthly_price,
      yearly_price: plan.yearly_price,
      max_team_members: plan.max_team_members,
      max_products: plan.max_products,
      max_locations: plan.max_locations,
      features: plan.features || [],
      is_active: plan.is_active
    } : undefined
  }
}

export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('monthly_price', { ascending: true })

  if (error) {
    console.error('Error getting plans:', error)
    return []
  }

  return (data || []).map(plan => ({
    ...plan,
    features: plan.features || []
  }))
}

export async function getPlanById(planId: number): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single()

  if (error || !data) return null

  return {
    ...data,
    features: data.features || []
  }
}

export async function getPlanByName(planName: string): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('name', planName)
    .single()

  if (error || !data) return null

  return {
    ...data,
    features: data.features || []
  }
}

export async function updateSubscriptionPlan(orgId: number, planId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ plan_id: planId })
      .eq('organization_id', orgId)

    if (error) {
      console.error('Error updating subscription plan:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Error updating subscription plan:', error)
    return false
  }
}

export async function cancelSubscription(orgId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        cancel_at_period_end: false
      })
      .eq('organization_id', orgId)

    if (error) {
      console.error('Error cancelling subscription:', error)
      return false
    }
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
  if (!subscription.plan) return true

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
    return { exceeded: true, exceededLimits: ['all'] }
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
