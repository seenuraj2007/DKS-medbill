'use client'

import { useState, useEffect, use, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Minus, RotateCcw, Package, TrendingUp, AlertTriangle, History, Edit, Trash2, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  sku: string | null
  barcode: string | null
  category: string | null
  current_quantity: number
  reorder_point: number
  supplier_name: string | null
  supplier_email: string | null
  supplier_phone: string | null
  unit_cost: number | null
  selling_price: number | null
  unit: string | null
  image_url: string | null
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

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productRes, historyRes] = await Promise.all([
        fetch(`/api/products/${resolvedParams.id}`),
        fetch(`/api/products/${resolvedParams.id}/history`)
      ])

      if (!productRes.ok) throw new Error('Failed to fetch product')

      const productData = await productRes.json()
      setProduct(productData.product)

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setStockHistory(historyData.history)
      }
    } catch (err) {
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [resolvedParams.id])

  const isLowStock = product ? product.current_quantity <= product.reorder_point : false
  const isOutOfStock = product ? product.current_quantity === 0 : false

  const recentHistory = useMemo(() => stockHistory.slice(0, 10), [stockHistory])

  const handleStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const quantity = parseInt(updateForm.quantity_change)
    if (isNaN(quantity) || quantity < 1) {
      setError('Please enter a valid quantity (minimum 1)')
      return
    }

    setUpdating(true)
    setError('')

    try {
      const res = await fetch(`/api/products/${resolvedParams.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity_change: quantity,
          change_type: updateForm.change_type,
          notes: updateForm.notes
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update stock')
      }

      setUpdateForm({ quantity_change: '', change_type: 'remove', notes: '' })
      await fetchData()
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-xl mb-6 animate-pulse" />
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 mb-6">
            <div className="h-10 w-3/4 bg-gray-200 rounded-xl mb-6 animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-20 bg-gray-200 rounded-xl mb-3 animate-pulse" />
                  <div className="h-8 w-32 bg-gray-200 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-72 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Product not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/products" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={`/products/${product.id}/edit`}
                className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                title="Edit product"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                title="Delete product"
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
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all text-sm font-medium mb-4 cursor-pointer"
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-red-100 to-red-200 text-red-700 whitespace-nowrap border border-red-200">
                <AlertTriangle className="w-4 h-4" /> Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-100 to-yellow-200 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-4 h-4" /> Low Stock
              </span>
            ) : null}
          </div>
        </div>

        {product.image_url && (
          <div className="mb-8">
            <img
              src={product.image_url}
              alt={product.name}
              className="max-w-xs rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100"
            />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-bold">!</span>
            </div>
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700 cursor-pointer">
              <span className="sr-only">Close</span>
              <span className="text-xl">&times;</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Stock Level</h2>
                  <p className="text-sm text-gray-500">Current inventory status</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Current Quantity</p>
                  <p className={`text-4xl font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>
                    {product.current_quantity}
                    <span className="text-lg font-normal text-gray-400 ml-2">{product.unit || 'units'}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-2">Reorder Point</p>
                  <p className="text-2xl font-semibold text-gray-600">{product.reorder_point}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOutOfStock ? 'bg-gradient-to-r from-red-400 to-red-500' : isLowStock ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min((product.current_quantity / Math.max(product.reorder_point, 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  {isOutOfStock
                    ? 'Product is out of stock'
                    : isLowStock
                    ? `Restock when below ${product.reorder_point} units`
                    : 'Stock is healthy'}
                </p>
              </div>

              <form onSubmit={handleStockUpdate} className="space-y-5 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                  <h3 className="font-semibold text-gray-900">Update Stock</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={updateForm.quantity_change}
                      onChange={(e) => setUpdateForm({ ...updateForm, quantity_change: e.target.value })}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md focus:bg-white text-gray-900 cursor-text"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                      Type
                    </label>
                    <select
                      value={updateForm.change_type}
                      onChange={(e) => setUpdateForm({ ...updateForm, change_type: e.target.value })}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md focus:bg-white text-gray-900 cursor-pointer appearance-none"
                    >
                      <option value="remove">Sold / Remove</option>
                      <option value="add">Add</option>
                      <option value="restock">Restock</option>
                    </select>
                  </div>
                </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-gray-400 rounded-full"></span>
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={updateForm.notes}
                      onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md focus:bg-white text-gray-900 cursor-text"
                      placeholder="Sale #12345"
                    />
                </div>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 cursor-pointer"
                >
                  <TrendingUp className="w-5 h-5" />
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Update Stock'
                  )}
                </button>
              </form>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    Stock History
                  </h2>
                  <p className="text-sm text-gray-500">Recent stock movements</p>
                </div>
              </div>
              {recentHistory.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                  <History className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No stock history yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentHistory.map((history) => (
                    <div
                      key={history.id}
                      className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        {getChangeTypeBadge(history.change_type)}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {history.change_type === 'remove' ? 'Removed' : history.change_type === 'add' ? 'Added' : 'Restocked'} {history.quantity_change} units
                          </p>
                          <p className="text-sm text-gray-500">
                            {history.previous_quantity} → {history.new_quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{new Date(history.created_at).toLocaleDateString()}</p>
                        {history.notes && <p className="text-xs text-gray-400 mt-1">{history.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Supplier Information</h3>
                  <p className="text-sm text-gray-500">Contact details</p>
                </div>
              </div>
              {product.supplier_name || product.supplier_email || product.supplier_phone ? (
                <div className="space-y-4">
                  {product.supplier_name && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="font-medium text-gray-900">{product.supplier_name}</p>
                    </div>
                  )}
                  {product.supplier_email && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-900">{product.supplier_email}</p>
                    </div>
                  )}
                  {product.supplier_phone && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="font-medium text-gray-900">{product.supplier_phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No supplier information</p>
              )}
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Product Details</h3>
                  <p className="text-sm text-gray-500">Metadata</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-gray-900">{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium text-gray-900">{new Date(product.updated_at).toLocaleDateString()}</span>
                </div>
                {product.selling_price && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Selling Price</span>
                    <span className="font-semibold text-green-600">${product.selling_price.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {isLowStock && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
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

