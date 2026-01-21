'use client'

import { useEffect, useState, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Package, TrendingDown, AlertTriangle, Bell, LogOut, Plus, Search, ArrowUpRight, ArrowDownRight, MapPin, Truck, FileText, ArrowUpDown, Menu, X, Users, CreditCard, Zap, Settings, User, Calculator, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  unreadAlerts: number
  lowStockItems: Array<{ id: string; name: string; current_quantity: number; reorder_point: number }>
  subscription?: {
    status: string
    plan?: {
      name: string
      display_name: string
      max_team_members: number
      max_products: number
      max_locations: number
    }
    trial_end_date?: string
  }
  usage?: {
    teamMembers: number
    products: number
    locations: number
  }
}

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  color: string
  trend?: number
}

const StatCard = memo(({ title, value, icon: Icon, color, trend }: StatCardProps) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-lg shadow-gray-200/50 p-3 sm:p-4 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
    <div className="flex items-center justify-between mb-2 sm:mb-3">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full ${
          trend > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        }`}>
          {trend > 0 ? <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
          {Math.abs(trend)}
        </span>
      )}
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{value}</h3>
    <p className="text-xs text-gray-500 mt-0.5">{title}</p>
  </div>
))

StatCard.displayName = 'StatCard'

interface LowStockItemProps {
  item: {
    id: string
    name: string
    current_quantity: number
    reorder_point: number
  }
  onClick: () => void
}

const LowStockItem = memo(({ item, onClick }: LowStockItemProps) => (
  <div
    className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100"
    onClick={onClick}
  >
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
        item.current_quantity === 0 ? 'bg-red-100' : 'bg-amber-100'
      }`}>
        <Package className={`w-4 h-4 ${
          item.current_quantity === 0 ? 'text-red-600' : 'text-amber-600'
        }`} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
        <p className="text-xs text-gray-500">
          {item.current_quantity === 0 ? 'Out of stock' : `${item.current_quantity} / ${item.reorder_point}`}
        </p>
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-400" />
  </div>
))

LowStockItem.displayName = 'LowStockItem'

function SkeletonCard() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 shadow-lg p-3 sm:p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-200"></div>
      </div>
      <div className="h-7 bg-gray-200 rounded w-16 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="h-5 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardClient({ initialStats }: { initialStats: DashboardStats | null }) {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(initialStats)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    if (stats?.subscription?.status === 'trial' && stats.subscription.trial_end_date) {
      const days = Math.ceil((new Date(stats.subscription.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      setTrialDaysLeft(days > 0 ? days : 0)
    }
  }, [stats?.subscription?.status, stats?.subscription?.trial_end_date])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        credentials: 'include',
        next: { revalidate: 30 }
      })
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    }
  }

  useEffect(() => {
    if (!initialStats) {
      fetchDashboard()
    }
  }, [initialStats])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 group cursor-pointer">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">StockAlert</span>
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                href="/products/new"
                prefetch={true}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add Product</span>
              </Link>
              <Link href="/alerts" prefetch={true} className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all cursor-pointer">
                <Bell className="w-5 h-5" />
                {stats?.unreadAlerts && stats.unreadAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer hidden sm:block"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {stats?.subscription?.status === 'trial' && stats.subscription.trial_end_date && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white px-3 py-2 sm:px-4 sm:py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold">
                {trialDaysLeft} days left in trial
              </span>
            </div>
            <Link href="/subscription" className="text-xs sm:text-sm font-semibold hover:underline flex items-center gap-0.5 sm:gap-1 cursor-pointer">
              Upgrade now <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      )}

      {stats?.subscription?.status === 'active' && stats.subscription.plan?.name === 'free' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-3 py-2 sm:px-4 sm:py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 text-amber-800 text-xs sm:text-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-medium">You&apos;re on the free plan with limited features</span>
            </div>
            <Link href="/subscription" className="text-xs sm:text-sm font-medium text-amber-700 hover:underline flex items-center gap-0.5 sm:gap-1 cursor-pointer">
              Upgrade to Pro <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:top-0 lg:left-0 shadow-xl lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 sm:py-4">
              <nav className="px-3 sm:px-4 space-y-1 sm:space-y-2">
                <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl font-semibold border border-indigo-100">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base">Dashboard</span>
                </Link>
                <Link href="/products" prefetch={true} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Products</span>
                </Link>
                <Link href="/locations" prefetch={true} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Locations</span>
                </Link>
                <Link href="/suppliers" prefetch={true} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Suppliers</span>
                </Link>
                <Link href="/purchase-orders" prefetch={true} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Purchase Orders</span>
                </Link>
                <Link href="/stock-transfers" prefetch={true} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Stock Transfers</span>
                </Link>
                <Link href="/billing" prefetch={false} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Billing / POS</span>
                </Link>
                <Link href="/alerts" prefetch={true} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Alerts</span>
                </Link>
                <Link href="/team" prefetch={false} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Team</span>
                </Link>
                <Link href="/subscription" prefetch={false} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Subscription</span>
                </Link>
                <Link href="/profile" prefetch={false} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Profile</span>
                </Link>
                <Link href="/settings/organization" prefetch={false} className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all cursor-pointer hover:shadow-md">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                  <span className="text-sm sm:text-base">Settings</span>
                </Link>
              </nav>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div onClick={() => setSidebarOpen(false)} className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
          <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-0.5 text-xs sm:text-sm">Overview of your inventory and alerts</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
              {!stats ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <StatCard title="Total Products" value={stats.totalProducts || 0} icon={Package} color="bg-gradient-to-br from-blue-500 to-blue-600" />
                  <StatCard title="Low Stock Items" value={stats.lowStockProducts || 0} icon={TrendingDown} color="bg-gradient-to-br from-amber-500 to-orange-500" trend={stats.lowStockProducts || 0} />
                  <StatCard title="Out of Stock" value={stats.outOfStockProducts || 0} icon={AlertTriangle} color="bg-gradient-to-br from-red-500 to-red-600" />
                  <StatCard title="Unread Alerts" value={stats.unreadAlerts || 0} icon={Bell} color="bg-gradient-to-br from-indigo-500 to-purple-600" />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {!stats ? (
                <>
                  <SkeletonList />
                  <SkeletonList />
                </>
              ) : (
                <>
                  <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-6">
                      <h2 className="text-base sm:text-xl font-bold text-gray-900">Low Stock Items</h2>
                      <Link href="/products" className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-semibold flex items-center gap-0.5 sm:gap-1 cursor-pointer hover:underline">
                        View All <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Link>
                    </div>

                    {stats.lowStockItems?.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                          <Package className="w-5 h-5 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium text-sm sm:text-base">No low stock items</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">All your products are well stocked!</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {stats.lowStockItems?.map((item) => (
                          <LowStockItem key={item.id} item={item} onClick={() => router.push(`/products/${item.id}`)} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                    <h2 className="text-base sm:text-xl font-bold mb-4 sm:mb-6 relative">Quick Actions</h2>
                    <div className="space-y-2 sm:space-y-3 relative">
                      <Link href="/products/new" className="block bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-4 hover:bg-white/30 hover:shadow-lg transition-all border border-white/10 cursor-pointer">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                          </div>
                          <span className="font-semibold text-sm sm:text-base">Add New Product</span>
                        </div>
                      </Link>
                      <Link href="/products" className="block bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-4 hover:bg-white/30 hover:shadow-lg transition-all border border-white/10 cursor-pointer">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Search className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                          </div>
                          <span className="font-semibold text-sm sm:text-base">View All Products</span>
                        </div>
                      </Link>
                      <Link href="/alerts" className="block bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-4 hover:bg-white/30 hover:shadow-lg transition-all border border-white/10 cursor-pointer">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Bell className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                          </div>
                          <span className="font-semibold text-sm sm:text-base">Check Alerts</span>
                        </div>
                      </Link>
                    </div>

                    <div className="mt-3 sm:mt-6 p-2.5 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10 relative">
                      <p className="text-xs sm:text-sm text-white/90">
                        <span className="font-semibold">Tip:</span> Set reorder points to automatically receive alerts when stock runs low.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
