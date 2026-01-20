'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, FileText, Edit, Trash2, ArrowUpRight, Package, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionGate } from '@/components/SubscriptionGate'

interface PurchaseOrder {
  id: string
  order_number: string
  status: 'pending' | 'sent' | 'received' | 'cancelled'
  total_cost: number
  created_at: string
  supplier_name?: string
  items_count?: number
}

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/purchase-orders')
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return

    const previousOrders = [...orders]
    setOrders(orders.filter(o => o.id !== id))

    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        setOrders(previousOrders)
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error)
      setOrders(previousOrders)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200',
      sent: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200',
      received: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200',
      cancelled: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200'
    }
    const statusLabels: Record<string, string> = {
      pending: 'Pending',
      sent: 'Sent',
      received: 'Received',
      cancelled: 'Cancelled'
    }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status] || statusStyles.pending}`}>
        {statusLabels[status] || status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
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
                  <FileText className="w-6 h-6 text-white" />
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {orders.length} orders created
              </p>
            </div>

            <Link
              href="/purchase-orders/new"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Create Order
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchase orders found</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Get started by creating your first purchase order to restock your inventory.</p>
                <Link
                  href="/purchase-orders/new"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  Create Order
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                      <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
                      <th className="hidden sm:table-cell px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                        onClick={() => router.push(`/purchase-orders/${order.id}`)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-orange-100 to-amber-100 shadow-sm group-hover:shadow-md transition-shadow">
                              <FileText className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors block">{order.order_number}</span>
                              {order.items_count && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Package className="w-3.5 h-3.5" />
                                  {order.items_count} items
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-5 text-gray-600 text-sm">
                          {order.supplier_name || '-'}
                        </td>
                        <td className="hidden sm:table-cell px-6 py-5 text-gray-600 text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="font-bold text-gray-900 text-lg">${order.total_cost.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/purchase-orders/${order.id}/edit`)
                              }}
                              className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(order.id)
                              }}
                              className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/purchase-orders/${order.id}`)
                              }}
                              className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                              title="View Details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </SubscriptionGate>
  )
}
