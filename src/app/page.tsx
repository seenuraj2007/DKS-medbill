'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (res.ok) {
        router.push('/dashboard')
      }
    })
  }, [router])

  return (
    <>
      <PWAInstallPrompt />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </div>
            <Link
              href="/auth"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all text-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-6 sm:mb-8 shadow-xl">
              <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Simple Inventory Tracking & Restock Reminders
            </h1>
            <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8">
              Never run out of stock again. Track your inventory, get automated alerts, and keep your business running smoothly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 sm:px-8 py-4 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
              <div className="text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Easy Product Management</h3>
                <p className="text-sm sm:text-base text-gray-600">Add and track products with SKU, category, and custom reorder points.</p>
              </div>
              <div className="text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Smart Alerts</h3>
                <p className="text-sm sm:text-base text-gray-600">Get notified automatically when stock runs low or is completely out.</p>
              </div>
              <div className="text-left">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                 <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Stock History</h3>
                <p className="text-sm sm:text-base text-gray-600">Track all inventory changes with a complete history log.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
