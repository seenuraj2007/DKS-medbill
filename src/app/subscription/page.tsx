'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Check, AlertTriangle, Calendar, Users, Package, MapPin, Crown, Zap, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { get, post } from '@/lib/fetch'

interface Plan {
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

interface Subscription {
  id: number
  status: string
  trial_end_date: string | null
  plan?: Plan
}

interface Usage {
  teamMembers: number
  products: number
  locations: number
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const res = await get('/api/subscription')
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      if (res.status === 403) {
        setError('Only owners can view subscription')
        setLoading(false)
        return
      }
      const data = await res.json()
      setSubscription(data.subscription)
      setPlans(data.plans)
      setUsage(data.usage)
    } catch (err) {
      setError('Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: number) => {
    setUpgrading(true)
    setError('')
    setSuccess('')

    try {
      const res = await post('/api/subscription', { planId })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upgrade')
      }

      setSuccess(data.message)
      fetchSubscription()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpgrading(false)
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0
    return Math.min(100, Math.round((current / limit) * 100))
  }

  const getUsageColor = (current: number, limit: number) => {
    if (limit === -1) return 'bg-green-500'
    const percentage = getUsagePercentage(current, limit)
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const isCurrentPlan = (planId: number) => subscription?.plan?.id === planId

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Subscription</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
            {success}
          </div>
        )}

        {subscription?.status === 'trial' && subscription.trial_end_date && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-6 h-6" />
              <h2 className="text-xl font-bold">Trial Period Active</h2>
            </div>
            <p className="text-white/80 mb-4">
              Your 30-day free trial ends on {new Date(subscription.trial_end_date).toLocaleDateString()}.
              Upgrade now to continue accessing all features.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{Math.ceil((new Date(subscription.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining</span>
            </div>
          </div>
        )}

        {subscription?.status === 'active' && subscription.plan?.name === 'free' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Free Plan Limitations</h3>
                <p className="text-yellow-700 mt-1">
                  You're on the free plan with limited features. Upgrade to Pro for unlimited access.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Plan</h2>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">{subscription?.plan?.display_name}</h3>
                    {subscription?.plan?.name === 'pro' && (
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-full">
                        PRO
                      </span>
                    )}
                    {subscription?.status === 'trial' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        TRIAL
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 mt-1">{subscription?.plan?.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    ${subscription?.plan?.monthly_price}
                    <span className="text-sm font-normal text-gray-500">/mo</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Usage</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Team Members
                      </span>
                      <span className="font-medium">
                        {usage?.teamMembers || 0} / {subscription?.plan?.max_team_members === -1 ? '∞' : subscription?.plan?.max_team_members}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getUsageColor(usage?.teamMembers || 0, subscription?.plan?.max_team_members || 0)}`}
                        style={{ width: `${getUsagePercentage(usage?.teamMembers || 0, subscription?.plan?.max_team_members || 0)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Products
                      </span>
                      <span className="font-medium">
                        {usage?.products || 0} / {subscription?.plan?.max_products === -1 ? '∞' : subscription?.plan?.max_products}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getUsageColor(usage?.products || 0, subscription?.plan?.max_products || 0)}`}
                        style={{ width: `${getUsagePercentage(usage?.products || 0, subscription?.plan?.max_products || 0)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Locations
                      </span>
                      <span className="font-medium">
                        {usage?.locations || 0} / {subscription?.plan?.max_locations === -1 ? '∞' : subscription?.plan?.max_locations}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getUsageColor(usage?.locations || 0, subscription?.plan?.max_locations || 0)}`}
                        style={{ width: `${getUsagePercentage(usage?.locations || 0, subscription?.plan?.max_locations || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>

            <div className="grid gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl border-2 p-6 transition-all ${
                    isCurrentPlan(plan.id)
                      ? 'border-indigo-500 shadow-md'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{plan.display_name}</h3>
                        {plan.name === 'pro' && (
                          <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium rounded-full">
                            BEST VALUE
                          </span>
                        )}
                        {isCurrentPlan(plan.id) && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 mt-1">{plan.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-gray-900">
                        ${plan.monthly_price}
                        <span className="text-sm font-normal text-gray-500">/mo</span>
                      </div>
                      {plan.monthly_price > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          ${plan.yearly_price}/year if billed annually
                        </p>
                      )}
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrentPlan(plan.id) || upgrading}
                        className={`mt-4 px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                          isCurrentPlan(plan.id)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                        }`}
                      >
                        {upgrading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isCurrentPlan(plan.id) ? (
                          'Current Plan'
                        ) : (
                          <>
                            {plan.monthly_price > (subscription?.plan?.monthly_price || 0) ? 'Upgrade' : 'Downgrade'}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Have questions about our plans or need assistance with your subscription?
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:support@stockalert.com"
                  className="block p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm"
                >
                  <div className="font-medium text-gray-900">Email Support</div>
                  <div className="text-gray-500">support@stockalert.com</div>
                </a>
                <div className="block p-3 bg-gray-50 rounded-xl text-sm">
                  <div className="font-medium text-gray-900">Live Chat</div>
                  <div className="text-gray-500">Available Mon-Fri 9am-5pm</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="font-medium">Enterprise</span>
                </div>
                <p className="text-sm text-indigo-700">
                  Need a custom plan with more users, features, or dedicated support?
                </p>
                <button className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  Contact Sales →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
