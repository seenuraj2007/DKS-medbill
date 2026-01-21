'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Package, MapPin, Truck, FileText, ArrowUpDown, Calculator,
  Bell, Users, CreditCard, Settings, User,
  Menu, X, LogOut, BarChart3
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
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

interface SidebarProps {
  children: React.ReactNode
}

export default function SidebarLayout({ children }: SidebarProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    window.location.href = '/'
  }

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${
          isActive
            ? 'text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isActive
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg'
            : 'bg-gray-100'
        }`}>
          <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
        </div>
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">StockAlert</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/products/new"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl cursor-pointer text-sm"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Add Product</span>
            </Link>
            <Link href="/alerts" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer relative">
              <Bell className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-3">
          {/* Close button */}
          <div className="px-4 pb-3 flex justify-end">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Logo */}
          <div className="px-4 pb-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">StockAlert</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
            {navItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl font-medium transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-gray-600" />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
