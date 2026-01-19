'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, X, AlertTriangle, Package, ArrowLeft, RefreshCw, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { get, patch } from '@/lib/fetch'
import { SubscriptionGate } from '@/components/SubscriptionGate'

interface Alert {
  id: number
  product_id: number
  product_name: string
  alert_type: 'low_stock' | 'out_of_stock'
  message: string
  is_read: number
  is_sent: number
  created_at: string
}

export default function AlertsPage() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [unreadOnly])

  const fetchAlerts = async () => {
    try {
      const res = await get(`/api/alerts?unread=${unreadOnly}`)
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      const data = await res.json()
      setAlerts(data.alerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (alertIds: number[]) => {
    try {
      await patch('/api/alerts', { alert_ids: alertIds, mark_as_read: true })
      fetchAlerts()
    } catch (error) {
      console.error('Error marking alerts as read:', error)
    }
  }

  const markAsUnread = async (alertIds: number[]) => {
    try {
      await patch('/api/alerts', { alert_ids: alertIds, mark_as_read: false })
      fetchAlerts()
    } catch (error) {
      console.error('Error marking alerts as unread:', error)
    }
  }

  const getAlertIcon = (type: string) => {
    return type === 'out_of_stock' ? (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-sm">
        <X className="w-6 h-6 text-red-600" />
      </div>
    ) : (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-sm">
        <AlertTriangle className="w-6 h-6 text-amber-600" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Bell className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                  <Package className="w-6 h-6 text-white" />
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all mb-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {alerts.filter(a => !a.is_read).length} unread alerts
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setUnreadOnly(false)}
                  className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    !unreadOnly
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  All Alerts
                </button>
                <button
                  onClick={() => setUnreadOnly(true)}
                  className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    unreadOnly
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  Unread
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6">
            <button
              onClick={() => markAsRead(alerts.filter(a => !a.is_read).map(a => a.id))}
              disabled={alerts.filter(a => !a.is_read).length === 0}
              className="w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All as Read
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 divide-y divide-gray-100">
            {alerts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No alerts</h3>
                <p className="text-gray-500">
                  {unreadOnly ? 'No unread alerts' : 'You have no alerts yet'}
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 sm:p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
                    !alert.is_read ? 'bg-indigo-50/50' : ''
                  }`}
                  onClick={() => router.push(`/products/${alert.product_id}`)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2 sm:gap-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">{alert.message}</h3>
                        {!alert.is_read && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Product: <span className="font-medium text-gray-700">{alert.product_name}</span></p>
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        <span>{new Date(alert.created_at).toLocaleString()}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      {!alert.is_read ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead([alert.id])
                          }}
                          className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsUnread([alert.id])
                          }}
                          className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                          title="Mark as unread"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        href={`/products/${alert.product_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                        title="View product"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </SubscriptionGate>
  )
}
