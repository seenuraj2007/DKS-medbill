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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!transfer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Stock transfer not found</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_transit: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    const statusLabels = {
      pending: 'Pending',
      in_transit: 'In Transit',
      completed: 'Completed',
      cancelled: 'Cancelled'
    }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/stock-transfers" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
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
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Stock Transfers
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ArrowUpDown className="w-8 h-8 text-purple-600" />
                Stock Transfer #{transfer.id}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {getStatusBadge(transfer.status)}
                <span className="text-gray-500">
                  Created: {new Date(transfer.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/stock-transfers/${transfer.id}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 rounded-lg font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Transfer Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3">
                      <ArrowUpDown className="w-6 h-6 text-red-600 rotate-180" />
                      <div>
                        <p className="text-sm text-gray-600">From</p>
                        <p className="font-semibold text-gray-900">{transfer.from_location_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-indigo-600">
                    <ArrowUpDown className="w-6 h-6" />
                  </div>
                  <div className="flex-1 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <ArrowUpDown className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">To</p>
                        <p className="font-semibold text-gray-900">{transfer.to_location_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {transfer.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{transfer.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm text-gray-600">Total Items</span>
                  </div>
                  <span className="font-semibold text-gray-900">{items.length}</span>
                </div>
                {transfer.status === 'completed' && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Transfer completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transfer Items</h2>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No items in this transfer</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{item.product_name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {item.product_sku || '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-900">{item.quantity}</span>
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
