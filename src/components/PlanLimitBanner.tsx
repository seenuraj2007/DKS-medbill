'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowUpRight } from 'lucide-react'

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

export default function PlanLimitBanner({ usage, plan }: { usage?: Usage; plan?: Plan }) {
  const [limitInfo, setLimitInfo] = useState<{ type: string; current: number; limit: number; displayName: string }[]>([])
  const [loading, setLoading] = useState(!usage || !plan)

  useEffect(() => {
    if (!usage || !plan) {
      fetchData()
    } else {
      calculateLimits(usage, plan)
    }
  }, [usage, plan])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        credentials: 'include',
        next: { revalidate: 0 }
      })

      if (res.status === 401) {
        window.location.href = '/auth'
        return
      }

      const data = await res.json()
      calculateLimits(data.usage || { teamMembers: 0, products: 0, locations: 0 }, data.subscription?.plan)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateLimits = (u: Usage, p: Plan | undefined) => {
    if (!p) {
      setLimitInfo([])
      setLoading(false)
      return
    }

    const limits: { type: string; current: number; limit: number; displayName: string }[] = []

    if (p.max_team_members !== -1 && u.teamMembers >= p.max_team_members) {
      limits.push({ type: 'team_members', current: u.teamMembers, limit: p.max_team_members, displayName: 'Team Members' })
    }

    if (p.max_products !== -1 && u.products >= p.max_products) {
      limits.push({ type: 'products', current: u.products, limit: p.max_products, displayName: 'Products' })
    }

    if (p.max_locations !== -1 && u.locations >= p.max_locations) {
      limits.push({ type: 'locations', current: u.locations, limit: p.max_locations, displayName: 'Locations' })
    }

    setLimitInfo(limits)
    setLoading(false)
  }

  if (loading) return null
  if (limitInfo.length === 0) return null

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="flex items-center gap-2 text-yellow-800 text-sm">
              <span className="font-medium">You&apos;ve exceeded your {limitInfo[0]?.displayName || 'plan'} limit:</span>
              <span className="hidden sm:inline">
                {limitInfo.map(l => `${l.displayName}: ${l.current}/${l.limit}`).join(', ')}
              </span>
            </div>
          </div>
          <Link 
            href="/subscription" 
            className="text-sm font-medium text-yellow-700 hover:text-yellow-900 hover:underline flex items-center gap-1"
          >
            Upgrade to unlock
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
