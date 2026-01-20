'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard, Check, AlertTriangle, Calendar, Users, Package, MapPin, Crown, Zap, ArrowRight, Loader2, ChevronRight, Package as PackageIcon, Mail } from 'lucide-react'
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
    if (percentage >= 80) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const isCurrentPlan = (planId: number) => subscription?.plan?.id === planId

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Crown className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <PackageIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all text-sm font-medium cursor-pointer"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 cursor-pointer">
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-700 rounded-2xl flex items-center gap-3">
            <Check className="w-5 h-5" />
            <span className="font-medium">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700 cursor-pointer">
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}

        {subscription?.status === 'trial' && subscription.trial_end_date && (
          <div className="mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">Trial Period Active</h2>
              </div>
              <p className="text-white/80 mb-4">
                Your 30-day free trial ends on {new Date(subscription.trial_end_date).toLocaleDateString()}.
                Upgrade now to continue accessing all features.
              </p>
              <div className="flex items-center gap-2 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl inline-flex">
                <Calendar className="w-4 h-4" />
                <span>{Math.ceil((new Date(subscription.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining</span>
              </div>
            </div>
          </div>
        )}

        {subscription?.status === 'active' && subscription.plan?.name === 'free' && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">Free Plan Limitations</h3>
                <p className="text-amber-700 mt-1">
                  You&apos;re on the free plan with limited features. Upgrade to Pro for unlimited access.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Plan</h2>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">{subscription?.plan?.display_name}</h3>
                    {subscription?.plan?.name === 'pro' && (
                      <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-full shadow-lg">
                        PRO
                      </span>
                    )}
                    {subscription?.status === 'trial' && (
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-semibold rounded-full">
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
                <h4 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                  Usage
                </h4>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Team Members
                      </span>
                      <span className="font-semibold">
                        {usage?.teamMembers || 0} / {subscription?.plan?.max_team_members === -1 ? '∞' : subscription?.plan?.max_team_members}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getUsageColor(usage?.teamMembers || 0, subscription?.plan?.max_team_members || 0)}`}
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
                      <span className="font-semibold">
                        {usage?.products || 0} / {subscription?.plan?.max_products === -1 ? '∞' : subscription?.plan?.max_products}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getUsageColor(usage?.products || 0, subscription?.plan?.max_products || 0)}`}
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
                      <span className="font-semibold">
                        {usage?.locations || 0} / {subscription?.plan?.max_locations === -1 ? '∞' : subscription?.plan?.max_locations}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getUsageColor(usage?.locations || 0, subscription?.plan?.max_locations || 0)}`}
                        style={{ width: `${getUsagePercentage(usage?.locations || 0, subscription?.plan?.max_locations || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Plans</h2>

            <div className="grid gap-5">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-white/80 backdrop-blur-xl rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                    isCurrentPlan(plan.id)
                      ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-500/10'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          plan.name === 'pro' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg' :
                          plan.name === 'starter' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                          'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          <Crown className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{plan.display_name}</h3>
                        {plan.name === 'pro' && (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
                            BEST VALUE
                          </span>
                        )}
                        {isCurrentPlan(plan.id) && (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 mt-1">{plan.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
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
                          ${plan.yearly_price}/year billed annually
                        </p>
                      )}
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrentPlan(plan.id) || upgrading}
                        className={`mt-4 px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg ${
                          isCurrentPlan(plan.id)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
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
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                Need Help?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Have questions about our plans or need assistance with your subscription?
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:support@stockalert.com"
                  className="block p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all cursor-pointer border border-gray-100"
                >
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    Email Support
                  </div>
                  <div className="text-sm text-gray-500 mt-1">support@stockalert.com</div>
                </a>
                <div className="block p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100 cursor-default">
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    <Chat className="w-4 h-4 text-indigo-600" />
                    Live Chat
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Available Mon-Fri 9am-5pm</div>
                </div>
              </div>

              <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <Crown className="w-5 h-5" />
                  <span className="font-semibold">Enterprise</span>
                </div>
                <p className="text-sm text-indigo-700 mb-3">
                  Need a custom plan with more users, features, or dedicated support?
                </p>
                <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer">
                  Contact Sales <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Chat({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}
