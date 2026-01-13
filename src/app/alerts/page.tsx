'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCheck, X, AlertTriangle, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
      const res = await fetch(`/api/alerts?unread=${unreadOnly}`)
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
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_ids: alertIds, mark_as_read: true })
      })
      fetchAlerts()
    } catch (error) {
      console.error('Error marking alerts as read:', error)
    }
  }

  const markAsUnread = async (alertIds: number[]) => {
    try {
      await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_ids: alertIds, mark_as_read: false })
      })
      fetchAlerts()
    } catch (error) {
      console.error('Error marking alerts as unread:', error)
    }
  }

  const getAlertIcon = (type: string) => {
    return type === 'out_of_stock' ? (
      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
        <X className="w-5 h-5 text-red-600" />
      </div>
    ) : (
      <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Alerts</h1>
              <p className="text-gray-500 mt-1">Stay informed about your inventory</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setUnreadOnly(false)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !unreadOnly
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Alerts
              </button>
              <button
                onClick={() => {
                  setUnreadOnly(true)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  unreadOnly
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unread Only
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 mb-4">
          <button
            onClick={() => markAsRead(alerts.filter(a => !a.is_read).map(a => a.id))}
            disabled={alerts.filter(a => !a.is_read).length === 0}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts</h3>
              <p className="text-gray-500">
                {unreadOnly ? 'No unread alerts' : 'You have no alerts yet'}
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors ${
                  !alert.is_read ? 'bg-indigo-50/50' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {getAlertIcon(alert.alert_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2 sm:gap-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{alert.message}</h3>
                      {!alert.is_read && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 whitespace-nowrap">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">Product: {alert.product_name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    {!alert.is_read ? (
                      <button
                        onClick={() => markAsRead([alert.id])}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsUnread([alert.id])}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Mark as unread"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <Link
                      href={`/products/${alert.product_id}`}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View product"
                    >
                      <Package className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
