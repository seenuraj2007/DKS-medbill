'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, ArrowUpDown, MapPin, Package, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionGate } from '@/components/SubscriptionGate'

interface Location {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string | null
  current_quantity: number
}

interface TransferItem {
  product_id: string
  quantity: number
}

export default function StockTransferFormPage({ params }: { params?: Promise<{ id?: string }> }) {
  const resolvedParams = params ? use(params) : undefined
  const router = useRouter()
  const isEdit = !!resolvedParams?.id
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')

  const [locations, setLocations] = useState<Location[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [formData, setFormData] = useState({
    from_location_id: '',
    to_location_id: '',
    status: 'pending' as 'pending' | 'in_transit' | 'completed' | 'cancelled',
    notes: '',
    items: [] as TransferItem[]
  })

  useEffect(() => {
    fetchLocationsAndProducts()
    if (isEdit) {
      fetchTransfer()
    }
  }, [resolvedParams?.id])

  const fetchLocationsAndProducts = async () => {
    try {
      const [locRes, prodRes] = await Promise.all([
        fetch('/api/locations'),
        fetch('/api/products')
      ])
      
      if (locRes.ok) {
        const locData = await locRes.json()
        setLocations(locData.locations || [])
      }
      
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.products || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchTransfer = async () => {
    try {
      const res = await fetch(`/api/stock-transfers/${resolvedParams?.id}`)
      if (!res.ok) throw new Error('Failed to fetch transfer')
      const data = await res.json()
      const transfer = data.stock_transfer
      setFormData({
        from_location_id: transfer.from_location_id.toString(),
        to_location_id: transfer.to_location_id.toString(),
        status: transfer.status,
        notes: transfer.notes || '',
        items: (transfer.items || []).map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      })
    } catch (err) {
      setError('Failed to load transfer')
    } finally {
      setFetching(false)
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1 }]
    })
  }

  const updateItem = (index: number, field: keyof TransferItem, value: number | string) => {
    const newItems = [...formData.items]
    
    if (field === 'product_id') {
      newItems[index] = {
        ...newItems[index],
        product_id: String(value)
      }
    } else if (field === 'quantity') {
      const numValue = Number(value)
      newItems[index] = {
        ...newItems[index],
        quantity: isNaN(numValue) ? 0 : numValue
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: Number(value)
      }
    }
    
    setFormData({ ...formData, items: newItems })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.items.length === 0) {
      setError('Please add at least one item')
      setLoading(false)
      return
    }

    const invalidItems = formData.items.filter(item => !item.product_id || item.quantity < 1)
    if (invalidItems.length > 0) {
      setError('All items must have a product selected and a valid quantity (minimum 1)')
      setLoading(false)
      return
    }

    if (!formData.from_location_id || !formData.to_location_id) {
      setError('Please select both source and destination locations')
      setLoading(false)
      return
    }

    if (formData.from_location_id === formData.to_location_id) {
      setError('Source and destination locations must be different')
      setLoading(false)
      return
    }

    try {
      const payload = {
        from_location_id: formData.from_location_id,
        to_location_id: formData.to_location_id,
        status: formData.status,
        notes: formData.notes,
        items: formData.items
      }

      const url = isEdit ? `/api/stock-transfers/${resolvedParams?.id}` : '/api/stock-transfers'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save stock transfer')
      }

      router.push('/stock-transfers')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <SubscriptionGate>
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/stock-transfers"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Stock Transfers
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Stock Transfer' : 'New Stock Transfer'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEdit ? 'Update stock transfer details' : 'Create a new stock transfer'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    From Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.from_location_id}
                      onChange={(e) => setFormData({ ...formData, from_location_id: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900"
                    >
                      <option value="">Select source location</option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>{location.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    To Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.to_location_id}
                      onChange={(e) => setFormData({ ...formData, to_location_id: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900"
                    >
                      <option value="">Select destination location</option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>{location.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Transfer Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No items added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click &quot;Add Item&quot; to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                            <select
                              value={item.product_id}
                              onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900"
                            >
                              <option value="">Select a product</option>
                              {products.filter(p => p.current_quantity > 0).map(product => (
                                <option key={product.id} value={product.id}>{product.name} {product.sku && `(${product.sku})`} - {product.current_quantity} available</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity || ''}
                              placeholder="1"
                              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes for this transfer..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 resize-none"
                />
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <Link
                  href="/stock-transfers"
                  className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : (isEdit ? 'Update Transfer' : 'Create Transfer')}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </SubscriptionGate>
  )
}
