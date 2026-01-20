'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileText, Truck, Package, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionGate } from '@/components/SubscriptionGate'

interface Supplier {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  sku: string | null
  unit_cost: number | null
}

interface OrderItem {
  product_id: string
  quantity: number
  unit_cost: number
}

export default function PurchaseOrderFormPage({ params }: { params?: Promise<{ id?: string }> }) {
  const resolvedParams = params ? use(params) : undefined
  const router = useRouter()
  const isEdit = !!resolvedParams?.id
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [formData, setFormData] = useState({
    supplier_id: '',
    status: 'pending' as 'pending' | 'sent' | 'received' | 'cancelled',
    notes: '',
    items: [] as OrderItem[]
  })

  useEffect(() => {
    fetchSuppliersAndProducts()
    if (isEdit) {
      fetchOrder()
    }
  }, [resolvedParams?.id])

  const fetchSuppliersAndProducts = async () => {
    try {
      setError('')
      const [supRes, prodRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/products')
      ])
      
      if (supRes.ok) {
        const supData = await supRes.json()
        setSuppliers(supData.suppliers || [])
      }
      
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.products || [])
      } else {
        const errorData = await prodRes.json()
        console.error('Failed to load products:', errorData)
        setError('Failed to load products. Please refresh.')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Error loading data. Please refresh.')
    }
  }

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/purchase-orders/${resolvedParams?.id}`)
      if (!res.ok) throw new Error('Failed to fetch order')
      const data = await res.json()
      const order = data.order
      setFormData({
        supplier_id: order.supplier_id,
        status: order.status,
        notes: order.notes || '',
        items: (order.items || []).map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost
        }))
      })
    } catch (err) {
      setError('Failed to load order')
    } finally {
      setFetching(false)
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1, unit_cost: 0 }]
    })
  }

  const updateItem = (index: number, field: keyof OrderItem, value: number | string) => {
    const newItems = [...formData.items]
    
    if (field === 'product_id') {
      const productId = String(value)
      console.log('Selecting product:', productId)
      
      if (productId && productId !== '0' && products.length > 0) {
        const product = products.find(p => p.id === productId)
        console.log('Found product:', product)
        if (product) {
          newItems[index] = {
            ...newItems[index],
            product_id: productId,
            unit_cost: product.unit_cost || 0
          }
        } else {
          newItems[index] = {
            ...newItems[index],
            product_id: productId,
            unit_cost: 0
          }
        }
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

    const itemsWithoutProduct = formData.items.filter(item => !item.product_id || item.product_id === '0')
    if (itemsWithoutProduct.length > 0) {
      setError('Some items do not have a product selected')
      setLoading(false)
      return
    }

    const itemsWithInvalidQuantity = formData.items.filter(item => !item.quantity || item.quantity < 1)
    if (itemsWithInvalidQuantity.length > 0) {
      setError('All items must have a valid quantity (minimum 1)')
      setLoading(false)
      return
    }

    const itemsWithInvalidCost = formData.items.filter(item => item.unit_cost === undefined || isNaN(item.unit_cost) || item.unit_cost < 0)
    if (itemsWithInvalidCost.length > 0) {
      setError('All items must have a valid unit cost')
      setLoading(false)
      return
    }

    if (!formData.supplier_id) {
      setError('Please select a supplier')
      setLoading(false)
      return
    }

    try {
      const total_cost = formData.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_cost || 0)), 0)

      const payload = {
        supplier_id: formData.supplier_id,
        status: formData.status,
        notes: formData.notes,
        items: formData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity || 1,
          unit_cost: item.unit_cost || 0,
          total_cost: (item.quantity || 0) * (item.unit_cost || 0)
        })),
        total_cost
      }

      const url = isEdit ? `/api/purchase-orders/${resolvedParams?.id}` : '/api/purchase-orders'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save purchase order')
      }

      router.push('/purchase-orders')
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

  const totalCost = formData.items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_cost || 0)), 0)

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/purchase-orders" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">StockAlert</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/purchase-orders"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Purchase Orders
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEdit ? 'Update purchase order details' : 'Create a new purchase order'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchSuppliersAndProducts} className="underline text-sm">Retry</button>
            </div>
          )}

          {products.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-700 text-sm mb-2">No products loaded. Click refresh to load products.</p>
              <button
                onClick={fetchSuppliersAndProducts}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700"
              >
                Load Products Now
              </button>
            </div>
          )}

          <div className="mb-4 text-xs text-gray-500 flex items-center gap-4">
            <span>Suppliers: {suppliers.length}</span>
            <span>Products: {products.length}</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={formData.supplier_id}
                      onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                      required
                      title="Select a supplier"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900"
                    >
                      <option value="">Select a supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    title="Select order status"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white text-gray-900"
                  >
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                    <option value="received">Received</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                    <div className="flex items-center gap-2">
                      {products.length === 0 && (
                        <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          Loading products...
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{products.length} products</span>
                      <button
                        type="button"
                        onClick={() => {
                          addItem()
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Item
                      </button>
                      <button
                        type="button"
                        onClick={fetchSuppliersAndProducts}
                        className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        title="Refresh products"
                      >
                        Refresh
                      </button>
                    </div>
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
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative pointer-events-auto">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1"
                          title="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pr-8">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                            <div className="relative">
                              <select
                                value={item.product_id}
                                onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                                title="Select a product for this order item"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-gray-900 appearance-none cursor-pointer"
                                style={{ position: 'relative', zIndex: 1 }}
                              >
                                <option value="">Select a product</option>
                                {products.length === 0 ? (
                                  <option value="" disabled>No products available</option>
                                ) : (
                                  products.map(product => (
                                    <option key={product.id} value={product.id}>{product.name} {product.sku && `(${product.sku})`}</option>
                                  ))
                                )}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
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
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost ($)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_cost || ''}
                              placeholder="0.00"
                              onChange={(e) => updateItem(index, 'unit_cost', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-sm text-gray-500">
                            Item Total: ${((item.quantity || 0) * (item.unit_cost || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.items.length > 0 && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Cost</span>
                      <span className="text-2xl font-bold text-indigo-600">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes for this purchase order..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 resize-none"
                />
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <Link
                  href="/purchase-orders"
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
                  {loading ? 'Saving...' : (isEdit ? 'Update Order' : 'Create Order')}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </SubscriptionGate>
  )
}
