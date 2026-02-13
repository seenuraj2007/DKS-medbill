'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PlanLimitBanner from '@/components/PlanLimitBanner'
import { useUpgradeToast } from '@/components/Providers'

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

interface SubscriptionData {
  subscription: {
    status: string
    plan?: Plan
    trial_end_date?: string
  }
  usage: Usage
}

export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState<Usage>({ teamMembers: 0, products: 0, locations: 0 })
  const [plan, setPlan] = useState<Plan | null>(null)
  const [hasShownWarning, setHasShownWarning] = useState(false)
  const { showLimitWarning, showLimitReached } = useUpgradeToast()

  useEffect(() => {
    checkSubscription()
  }, [])

  // Check and show warnings for limits approaching
  useEffect(() => {
    if (loading || hasShownWarning || !plan) return

    const NEAR_LIMIT_THRESHOLD = 80

    const checkLimitAndNotify = (
      type: 'products' | 'team_members' | 'locations',
      current: number,
      max: number
    ) => {
      if (max === -1) return false // Unlimited
      const percentage = Math.round((current / max) * 100)
      
      if (current >= max) {
        showLimitReached(type, current, max, plan.display_name)
        return true
      } else if (percentage >= NEAR_LIMIT_THRESHOLD) {
        showLimitWarning(type, current, max, plan.display_name)
        return true
      }
      return false
    }

    // Check each limit type and show notification for the first one that's near/at limit
    const shown = 
      checkLimitAndNotify('products', usage.products, plan.max_products) ||
      checkLimitAndNotify('team_members', usage.teamMembers, plan.max_team_members) ||
      checkLimitAndNotify('locations', usage.locations, plan.max_locations)

    if (shown) {
      setHasShownWarning(true)
    }
  }, [loading, usage, plan, hasShownWarning, showLimitWarning, showLimitReached])

  const checkSubscription = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        credentials: 'include',
        next: { revalidate: 0 }
      })

      if (res.status === 401) {
        router.push('/auth')
        return
      }

      const data: SubscriptionData = await res.json()
      
      setUsage(data.usage || { teamMembers: 0, products: 0, locations: 0 })
      setPlan(data.subscription?.plan || null)
    } catch (error) {
      console.error('Error checking subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <>
      <PlanLimitBanner usage={usage} plan={plan || undefined} />
      {children}
    </>
  )
}
