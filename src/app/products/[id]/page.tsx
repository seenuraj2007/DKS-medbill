'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Minus, RotateCcw, Package, TrendingUp, AlertTriangle, History, Edit, Trash2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  sku: string | null
  category: string | null
  current_quantity: number
  reorder_point: number
  supplier_name: string | null
  supplier_email: string | null
  supplier_phone: string | null
  created_at: string
  updated_at: string
}

interface StockHistory {
  id: number
  previous_quantity: number
  quantity_change: number
  new_quantity: number
  change_type: 'add' | 'remove' | 'restock' | 'transfer_in' | 'transfer_out'
  notes: string | null
  created_at: string
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  const [updateForm, setUpdateForm] = useState({
    quantity_change: '',
    change_type: 'remove',
    notes: ''
  })

  useEffect(() => {
    fetchProduct()
    fetchHistory()
  }, [resolvedParams.id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${resolvedParams.id}`)
      if (!res.ok) throw new Error('Failed to fetch product')
      const data = await res.json()
      setProduct(data.product)
    } catch (err) {
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/products/${resolvedParams.id}/history`)
      if (res.ok) {
        const data = await res.json()
        setStockHistory(data.history)
      }
    } catch (err) {
      console.error('Error fetching history:', err)
    }
  }

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!updateForm.quantity_change) return

    setUpdating(true)
    setError('')

    try {
      const res = await fetch(`/api/products/${resolvedParams.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity_change: parseInt(updateForm.quantity_change),
          change_type: updateForm.change_type,
          notes: updateForm.notes
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update stock')
      }

      setUpdateForm({ quantity_change: '', change_type: 'remove', notes: '' })
      fetchProduct()
      fetchHistory()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/products/${resolvedParams.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/products')
      }
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  const getChangeTypeBadge = (type: string) => {
    const badges = {
      add: 'bg-green-100 text-green-700',
      remove: 'bg-red-100 text-red-700',
      restock: 'bg-blue-100 text-blue-700'
    }
    const icons = {
      add: Plus,
      remove: Minus,
      restock: RotateCcw
    }
    const Icon = icons[type as keyof typeof icons]
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badges[type as keyof typeof badges]}`}>
        <Icon className="w-3 h-3" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    )
  }

  const isLowStock = product.current_quantity <= product.reorder_point
  const isOutOfStock = product.current_quantity === 0

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/products" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={`/products/${product.id}/edit`}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                {product.sku && `SKU: ${product.sku}`}
                {product.sku && product.category && ' • '}
                {product.category && `Category: ${product.category}`}
              </p>
            </div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-700 whitespace-nowrap">
                <AlertTriangle className="w-4 h-4" /> Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                <AlertTriangle className="w-4 h-4" /> Low Stock
              </span>
            ) : null}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Stock Level</h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Quantity</p>
                  <p className={`text-4xl font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {product.current_quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Reorder Point</p>
                  <p className="text-2xl font-semibold text-gray-600">{product.reorder_point}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((product.current_quantity / Math.max(product.reorder_point, 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {isOutOfStock
                    ? 'Product is out of stock'
                    : isLowStock
                    ? `Restock when below ${product.reorder_point} units`
                    : 'Stock is healthy'}
                </p>
              </div>

              <form onSubmit={handleStockUpdate} className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900">Update Stock</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={updateForm.quantity_change}
                      onChange={(e) => setUpdateForm({ ...updateForm, quantity_change: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={updateForm.change_type}
                      onChange={(e) => setUpdateForm({ ...updateForm, change_type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-gray-900"
                    >
                      <option value="remove">Sold / Remove</option>
                      <option value="add">Add</option>
                      <option value="restock">Restock</option>
                    </select>
                  </div>
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                    <input
                      type="text"
                      value={updateForm.notes}
                      onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                      placeholder="Sale #12345"
                    />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <TrendingUp className="w-4 h-4" />
                  {updating ? 'Updating...' : 'Update Stock'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <History className="w-5 h-5" />
                Stock History
              </h2>
              {stockHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No stock history yet</p>
              ) : (
                <div className="space-y-4">
                  {stockHistory.slice(0, 10).map((history) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        {getChangeTypeBadge(history.change_type)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {history.change_type === 'remove' ? 'Removed' : history.change_type === 'add' ? 'Added' : 'Restocked'} {history.quantity_change} units
                          </p>
                          <p className="text-sm text-gray-500">
                            {history.previous_quantity} → {history.new_quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{new Date(history.created_at).toLocaleDateString()}</p>
                        {history.notes && <p className="text-xs text-gray-400">{history.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Supplier Information</h3>
              {product.supplier_name || product.supplier_email || product.supplier_phone ? (
                <div className="space-y-3">
                  {product.supplier_name && (
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{product.supplier_name}</p>
                    </div>
                  )}
                  {product.supplier_email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{product.supplier_email}</p>
                    </div>
                  )}
                  {product.supplier_phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{product.supplier_phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No supplier information</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">{new Date(product.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">{new Date(product.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {isLowStock && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Low Stock Alert</h3>
                    <p className="text-sm text-gray-600">
                      {isOutOfStock
                        ? 'This product is out of stock. Consider restocking soon.'
                        : `Stock is running low. Consider restocking when below ${product.reorder_point} units.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
