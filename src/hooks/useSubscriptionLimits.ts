'use client'

import { useState, useEffect, useCallback } from 'react'

interface Usage {
  teamMembers: number
  products: number
  locations: number
}

interface Plan {
  name: string
  display_name: string
  max_team_members: number
  max_products: number
  max_locations: number
}

interface Subscription {
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'
  plan?: Plan
  trial_end_date?: string
}

interface LimitStatus {
  type: 'products' | 'team_members' | 'locations'
  current: number
  limit: number
  percentage: number
  isAtLimit: boolean
  isNearLimit: boolean // 80% or more
}

interface SubscriptionLimitsState {
  loading: boolean
  subscription: Subscription | null
  usage: Usage
  limits: {
    products: LimitStatus | null
    team_members: LimitStatus | null
    locations: LimitStatus | null
  }
  isAnyLimitReached: boolean
  isAnyLimitNear: boolean
  planName: string
  refetch: () => Promise<void>
}

const NEAR_LIMIT_THRESHOLD = 80 // percentage

export function useSubscriptionLimits(): SubscriptionLimitsState {
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage>({ teamMembers: 0, products: 0, locations: 0 })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/dashboard/stats', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (res.status === 401) {
        return
      }

      const data = await res.json()
      setSubscription(data.subscription || null)
      setUsage(data.usage || { teamMembers: 0, products: 0, locations: 0 })
    } catch (error) {
      console.error('Error fetching subscription limits:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const calculateLimitStatus = (
    type: 'products' | 'team_members' | 'locations',
    current: number,
    maxLimit: number
  ): LimitStatus | null => {
    if (maxLimit === -1) return null // Unlimited

    const percentage = maxLimit > 0 ? Math.round((current / maxLimit) * 100) : 0

    return {
      type,
      current,
      limit: maxLimit,
      percentage,
      isAtLimit: current >= maxLimit,
      isNearLimit: percentage >= NEAR_LIMIT_THRESHOLD && current < maxLimit,
    }
  }

  const plan = subscription?.plan
  const limits = {
    products: plan ? calculateLimitStatus('products', usage.products, plan.max_products) : null,
    team_members: plan ? calculateLimitStatus('team_members', usage.teamMembers, plan.max_team_members) : null,
    locations: plan ? calculateLimitStatus('locations', usage.locations, plan.max_locations) : null,
  }

  const isAnyLimitReached = Object.values(limits).some((l) => l?.isAtLimit)
  const isAnyLimitNear = Object.values(limits).some((l) => l?.isNearLimit)

  return {
    loading,
    subscription,
    usage,
    limits,
    isAnyLimitReached,
    isAnyLimitNear,
    planName: plan?.display_name || plan?.name || 'Free',
    refetch: fetchData,
  }
}

// Hook to check a specific limit and show notification
export function useLimitCheck() {
  const checkAndHandleLimit = useCallback(async (
    response: Response,
    onLimitReached?: (data: { limit: number; current: number; upgradeUrl: string }) => void
  ): Promise<{ blocked: boolean; data?: any }> => {
    const data = await response.json()

    if (response.status === 403 && data.limit !== undefined) {
      onLimitReached?.({
        limit: data.limit,
        current: data.current,
        upgradeUrl: data.upgradeUrl || '/subscription',
      })
      return { blocked: true, data }
    }

    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }

    return { blocked: false, data }
  }, [])

  return { checkAndHandleLimit }
}
