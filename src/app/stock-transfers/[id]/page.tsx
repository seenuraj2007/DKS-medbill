'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpDown, MapPin, Package, Edit, ArrowUpRight, Trash2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface TransferItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string | null
  quantity: number
}

interface StockTransfer {
  id: number
  from_location_name: string | null
  to_location_name: string | null
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

export default function StockTransferDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [transfer, setTransfer] = useState<StockTransfer | null>(null)
  const [items, setItems] = useState<TransferItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransferDetails()
  }, [resolvedParams?.id])

  const fetchTransferDetails = async () => {
    try {
      const res = await fetch(`/api/stock-transfers/${resolvedParams?.id}`)
      if (!res.ok) throw new Error('Failed to fetch transfer')
      const data = await res.json()
      setTransfer(data.stock_transfer)
      setItems(data.stock_transfer.items || [])
    } catch (error) {
      console.error('Error fetching transfer details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this stock transfer?')) return

    try {
      const res = await fetch(`/api/stock-transfers/${resolvedParams?.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/stock-transfers')
      }
    } catch (error) {
      console.error('Error deleting transfer:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowUpDown className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading transfer details...</p>
        </div>
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center">
          <ArrowUpDown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Stock transfer not found</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200',
      in_transit: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200',
      completed: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200',
      cancelled: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-200'
    }
    const statusLabels = {
      pending: 'Pending',
      in_transit: 'In Transit',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
    const icons = {
      pending: '⏳',
      in_transit: '🚚',
      completed: '✓',
      cancelled: '✕'
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusStyles[status as keyof typeof statusStyles]}`}>
        <span>{icons[status as keyof typeof icons]}</span>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/stock-transfers" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <ArrowUpDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/stock-transfers"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all text-sm font-medium mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stock Transfers
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                  <ArrowUpDown className="w-6 h-6 text-purple-600" />
                </div>
                Stock Transfer #{transfer.id}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                {getStatusBadge(transfer.status)}
                <span className="text-gray-500 flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  Created: {new Date(transfer.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/stock-transfers/${transfer.id}/edit`}
                className="px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 border border-red-200 rounded-xl font-medium text-red-700 hover:bg-red-50 hover:border-red-300 transition-all flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <ArrowUpDown className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Transfer Details</h2>
                  <p className="text-sm text-gray-500">Route and inventory information</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-5 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <ArrowUpDown className="w-6 h-6 text-red-600 rotate-180" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">From</p>
                        <p className="font-semibold text-gray-900 text-lg">{transfer.from_location_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-indigo-600">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                      <ArrowUpDown className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <ArrowUpDown className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">To</p>
                        <p className="font-semibold text-gray-900 text-lg">{transfer.to_location_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {transfer.notes && (
                  <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Notes</p>
                    <p className="text-gray-900 leading-relaxed">{transfer.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Summary</h2>
                  <p className="text-sm text-gray-500">Overview</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="text-gray-600 font-medium">Total Items</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{items.length}</span>
                </div>
                {transfer.status === 'completed' && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-green-700">Transfer completed</span>
                  </div>
                )}
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <p className="text-sm text-indigo-600 mb-1">Status</p>
                  <p className="text-xl font-bold text-indigo-900 capitalize">{transfer.status.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Transfer Items</h2>
              <p className="text-sm text-gray-500">Products being transferred</p>
            </div>
          </div>
          {items.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No items in this transfer</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="font-medium text-gray-900">{item.product_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {item.product_sku || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-700">
                          {item.quantity}
                        </span>
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
  )
}
