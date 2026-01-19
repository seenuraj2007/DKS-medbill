'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, TrendingDown, AlertTriangle, Bell, LogOut, Plus, Search,
  MapPin, Truck, FileText, ArrowUpDown, Menu, X, Users, CreditCard,
  Settings, User, Calculator, ChevronRight, ArrowUpRight,
  LayoutDashboard, BarChart3, Clock, CheckCircle
} from 'lucide-react'
import { SubscriptionGate } from '@/components/SubscriptionGate'

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
    }
    trial_end_date?: string
  }
}

const sidebarLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/locations', label: 'Locations', icon: MapPin },
  { href: '/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/purchase-orders', label: 'Purchase Orders', icon: FileText },
  { href: '/stock-transfers', label: 'Stock Transfers', icon: ArrowUpDown },
  { href: '/billing', label: 'Billing / POS', icon: Calculator },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings/organization', label: 'Settings', icon: Settings },
]

const statCards = [
  { key: 'totalProducts', label: 'Total Products', icon: Package, color: 'bg-sky-500', bgLight: 'bg-sky-50', textColor: 'text-sky-600' },
  { key: 'lowStockProducts', label: 'Low Stock Items', icon: TrendingDown, color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-600' },
  { key: 'outOfStockProducts', label: 'Out of Stock', icon: AlertTriangle, color: 'bg-red-500', bgLight: 'bg-red-50', textColor: 'text-red-600' },
  { key: 'unreadAlerts', label: 'Unread Alerts', icon: Bell, color: 'bg-emerald-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
]

const quickActions = [
  { label: 'Add New Product', href: '/products/new', icon: Plus },
  { label: 'View All Products', href: '/products', icon: Search },
  { label: 'Check Alerts', href: '/alerts', icon: Bell },
]

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fetchDashboard = useCallback(async () => {
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
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f766e]"></div>
            <Package className="w-6 h-6 text-[#0f766e] absolute inset-0 m-auto" />
          </div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-slate-50">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
              <div className="w-10 h-10 bg-[#0f766e] rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">StockAlert</h1>
                <p className="text-xs text-slate-500">Inventory Management</p>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              {sidebarLinks.map((link) => {
                const Icon = link.icon
                const isActive = link.href === '/dashboard'
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 mb-1 rounded-lg transition-all duration-200 ${isActive ? 'bg-[#0f766e] text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="lg:ml-64">
          <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="hidden sm:block">
                  <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
                  <p className="text-xs text-slate-500">Overview of your inventory</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/products/new"
                  className="hidden sm:flex items-center gap-2 bg-[#0f766e] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0d6560] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Link>
                <Link
                  href="/alerts"
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {stats?.unreadAlerts ? (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  ) : null}
                </Link>
                <Link
                  href="/profile"
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </header>

          {stats?.subscription?.status === 'trial' && stats.subscription.trial_end_date && (
            <div className="bg-gradient-to-r from-[#0f766e] to-[#0d6560] text-white px-4 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {Math.ceil((new Date(stats.subscription.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left in your trial
                  </span>
                </div>
                <Link href="/subscription" className="text-sm font-medium hover:underline flex items-center gap-1">
                  Upgrade now <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {stats?.subscription?.status === 'active' && stats.subscription.plan?.name === 'free' && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3 text-amber-800 text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">You're on the free plan with limited features</span>
                </div>
                <Link href="/subscription" className="text-sm font-medium text-amber-700 hover:underline flex items-center gap-1">
                  Upgrade to Pro <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon
                const value = stats?.[stat.key as keyof DashboardStats] ?? 0
                return (
                  <div key={stat.key} className="card p-5">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-lg ${stat.bgLight} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${stat.textColor}`} />
                      </div>
                      {stat.key === 'lowStockProducts' && (
                        <span className="badge badge-warning">{String(value)}</span>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-2xl font-bold text-slate-900">{String(value)}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card">
                <div className="card-header flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Low Stock Items</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Items that need restocking</p>
                  </div>
                  <Link href="/products" className="text-sm text-[#0f766e] font-medium hover:underline flex items-center gap-1">
                    View All <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="card-body">
                  {stats?.lowStockItems?.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">All items are well stocked!</p>
                      <p className="text-sm text-slate-400 mt-1">No low stock alerts at the moment</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats?.lowStockItems?.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          onClick={() => router.push(`/products/${item.id}`)}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.current_quantity === 0 ? 'bg-red-100' : 'bg-amber-100'}`}>
                              <Package className={`w-4 h-4 ${item.current_quantity === 0 ? 'text-red-600' : 'text-amber-600'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-slate-900 text-sm truncate">{item.name}</h4>
                              <p className="text-xs text-slate-500">
                                {item.current_quantity === 0 ? 'Out of stock' : `${item.current_quantity} / ${item.reorder_point}`}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card bg-slate-900 text-white">
                <div className="card-header border-slate-700">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Common tasks</p>
                </div>
                <div className="card-body space-y-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="flex items-center gap-3 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{action.label}</span>
                      </Link>
                    )
                  })}
                </div>
                <div className="card-footer border-slate-700 bg-slate-800/50">
                  <p className="text-xs text-slate-400">
                    <span className="font-medium text-slate-300">Tip:</span> Set reorder points to get alerts when stock runs low.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SubscriptionGate>
  )
}
