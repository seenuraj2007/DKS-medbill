'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, TrendingDown, AlertTriangle, Bell, LogOut, Plus, Search, Filter, MoreVertical, ArrowUpRight, ArrowDownRight, MapPin, Truck, FileText, ArrowUpDown, Menu, X, Users, CreditCard, Zap, Settings, User, History, Calculator } from 'lucide-react'
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
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      })
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-sm font-medium flex items-center gap-1 ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">StockAlert</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                href="/products"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-2 sm:px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add Product</span>
              </Link>
              <Link href="/alerts" className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="w-5 h-5" />
                {stats?.unreadAlerts && stats.unreadAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {stats?.subscription?.status === 'trial' && stats.subscription.trial_end_date && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">
                {Math.ceil((new Date(stats.subscription.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left in trial
              </span>
            </div>
            <Link href="/subscription" className="text-sm font-medium hover:underline">
              Upgrade now →
            </Link>
          </div>
        </div>
      )}

      {stats?.subscription?.status === 'active' && stats.subscription.plan?.name === 'free' && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-800 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>You're on the free plan with limited features</span>
            </div>
            <Link href="/subscription" className="text-sm font-medium text-yellow-700 hover:underline">
              Upgrade to Pro →
            </Link>
          </div>
        </div>
      )}

      <div className="flex">
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:top-0 lg:left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
              <span className="text-lg font-bold text-gray-900">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-2 text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-gray-900 bg-indigo-50 rounded-lg font-medium"
                  >
                    <Package className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link
                    href="/products"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    Products
                  </Link>
                  <Link
                    href="/locations"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                    Locations
                  </Link>
                  <Link
                    href="/suppliers"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <Truck className="w-5 h-5" />
                    Suppliers
                  </Link>
                  <Link
                    href="/purchase-orders"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    Purchase Orders
                  </Link>
                  <Link
                    href="/stock-transfers"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <ArrowUpDown className="w-5 h-5" />
                    Stock Transfers
                  </Link>
                  <Link
                    href="/billing"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <Calculator className="w-5 h-5" />
                    Billing / POS
                  </Link>
                  <Link
                    href="/alerts"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    Alerts
                  </Link>
                  <Link
                    href="/team"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    Team
                  </Link>
                  <Link
                    href="/subscription"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <CreditCard className="w-5 h-5" />
                    Subscription
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <Link
                    href="/settings/organization"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <Link
                    href="/audit-logs"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    <History className="w-5 h-5" />
                    Audit Logs
                  </Link>
                </nav>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div onClick={() => setSidebarOpen(false)} className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}></div>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your inventory and alerts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={Package}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Low Stock Items"
            value={stats?.lowStockProducts || 0}
            icon={TrendingDown}
            color="bg-gradient-to-br from-yellow-500 to-orange-500"
            trend={stats?.lowStockProducts || 0}
          />
          <StatCard
            title="Out of Stock"
            value={stats?.outOfStockProducts || 0}
            icon={AlertTriangle}
            color="bg-gradient-to-br from-red-500 to-red-600"
          />
          <StatCard
            title="Unread Alerts"
            value={stats?.unreadAlerts || 0}
            icon={Bell}
            color="bg-gradient-to-br from-indigo-500 to-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Low Stock Items</h2>
              <Link
                href="/products"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {stats?.lowStockItems?.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">No low stock items</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.lowStockItems?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/products/${item.id}`)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.current_quantity === 0 ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <Package className={`w-5 h-5 ${
                          item.current_quantity === 0 ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {item.current_quantity === 0 ? 'Out of stock' : `${item.current_quantity} / ${item.reorder_point} units`}
                        </p>
                      </div>
                    </div>
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-4 sm:p-6 text-white">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/products/new"
                className="block bg-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add New Product</span>
                </div>
              </Link>
              <Link
                href="/products"
                className="block bg-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5" />
                  <span className="font-medium">View All Products</span>
                </div>
              </Link>
              <Link
                href="/alerts"
                className="block bg-white/20 backdrop-blur-sm rounded-xl p-4 hover:bg-white/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" />
                  <span className="font-medium">Check Alerts</span>
                </div>
              </Link>
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-xl">
              <p className="text-sm text-white/80">
                💡 Tip: Set reorder points to automatically receive alerts when stock runs low.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</div>
  )
}
