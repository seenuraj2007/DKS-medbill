'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'
import {
  Package, MapPin, Truck, FileText, ArrowUpDown, Calculator,
  Bell, Users, Settings, User, LogOut,
  BarChart3, TrendingUp, Receipt, Tag, ChevronRight
} from 'lucide-react'
import SidebarLayout from '@/components/SidebarLayout'

interface MenuItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

const menuGroups = [
  {
    title: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
      { href: '/analytics', label: 'Analytics', icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    ]
  },
  {
    title: 'Inventory',
    items: [
      { href: '/products', label: 'Products', icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50' },
      { href: '/serial-numbers', label: 'Serial Numbers', icon: Tag, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
      { href: '/locations', label: 'Locations', icon: MapPin, color: 'text-green-600', bgColor: 'bg-green-50' },
      { href: '/suppliers', label: 'Suppliers', icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-50' },
      { href: '/purchase-orders', label: 'Purchase Orders', icon: FileText, color: 'text-pink-600', bgColor: 'bg-pink-50' },
      { href: '/stock-transfers', label: 'Stock Transfers', icon: ArrowUpDown, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    ]
  },
  {
    title: 'Sales',
    items: [
      { href: '/billing', label: 'Billing / POS', icon: Calculator, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
      { href: '/invoices', label: 'Invoices', icon: Receipt, color: 'text-violet-600', bgColor: 'bg-violet-50' },
    ]
  },
  {
    title: 'Management',
    items: [
      { href: '/alerts', label: 'Alerts', icon: Bell, color: 'text-red-600', bgColor: 'bg-red-50' },
      { href: '/team', label: 'Team', icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
      { href: '/profile', label: 'Profile', icon: User, color: 'text-gray-600', bgColor: 'bg-gray-50' },
      { href: '/settings', label: 'Settings', icon: Settings, color: 'text-slate-600', bgColor: 'bg-slate-50' },
    ]
  }
]

export default function MorePage() {
  const pathname = usePathname()
  
  const locale = useMemo(() => {
    const pathParts = pathname.split('/')
    return pathParts[1] === 'en' || pathParts[1] === 'hi' ? pathParts[1] : 'en'
  }, [pathname])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/'
  }

  const isActive = (href: string) => {
    const localizedHref = `/${locale}${href}`
    return pathname === localizedHref || pathname.startsWith(`${localizedHref}/`)
  }

  return (
    <SidebarLayout>
      <div className="sm:max-w-7xl mx-auto pb-20 sm:pb-0">
        {/* Mobile App Header */}
        <div className="sm:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">More</h1>
            <div className="w-8" />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900">More</h1>
          <p className="text-gray-500 mt-1">Access all features</p>
        </div>

        {/* Mobile Content */}
        <div className="sm:hidden mt-16 space-y-6">
          {menuGroups.map((group, groupIndex) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
                {group.title}
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {group.items.map((item, index) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <Link
                      key={item.href}
                      href={`/${locale}${item.href}`}
                      className={`flex items-center gap-4 px-4 py-4 ${
                        index !== group.items.length - 1 ? 'border-b border-gray-50' : ''
                      } active:bg-gray-50 transition-colors`}
                    >
                      <div className={`w-11 h-11 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${active ? 'text-indigo-600' : 'text-gray-900'}`}>
                          {item.label}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <div className="pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-4 bg-white rounded-2xl border border-gray-100 active:bg-red-50 transition-colors"
            >
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-600">Logout</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* App Version */}
          <div className="text-center pt-4 pb-8">
            <p className="text-xs text-gray-400">DKS StockAlert v1.0.0</p>
          </div>
        </div>

        {/* Desktop Content - Grid Layout */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4">
          {menuGroups.flatMap(group => group.items).map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={`flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border transition-all hover:shadow-lg hover:border-indigo-200 ${
                  active ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'
                }`}
              >
                <div className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <span className={`font-medium text-center ${active ? 'text-indigo-600' : 'text-gray-900'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </SidebarLayout>
  )
}
