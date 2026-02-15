'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Package, Truck, Edit, Trash2, CheckCircle, Tag, X, Plus } from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_sku: string | null
  quantity: number
  unit_cost: number
  total_cost: number
  received_quantity: number
  has_serial_numbers: boolean
}

interface PurchaseOrder {
  id: string
  order_number: string
  status: 'DRAFT' | 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED'
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
  supplier_name?: string
  supplier_email?: string
  supplier_phone?: string
}

export default function PurchaseOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  
  // Serial number modal state
  const [showSerialModal, setShowSerialModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null)
  const [serialNumbers, setSerialNumbers] = useState<string[]>([])
  const [serialInputMode, setSerialInputMode] = useState<'bulk' | 'csv'>('bulk')
  const [csvContent, setCsvContent] = useState('')
  const [savingSerials, setSavingSerials] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
  }, [resolvedParams?.id])

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/purchase-orders/${resolvedParams?.id}`)
      if (!res.ok) throw new Error('Failed to fetch order')
      const data = await res.json()
      setOrder(data.order)
      setItems(data.order.items || [])
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this purchase order?')) return

    try {
      const res = await fetch(`/api/purchase-orders/${resolvedParams?.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/purchase-orders')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }

  const updateReceivedQuantity = async (itemId: string, quantity: number) => {
    setUpdating(itemId)
    try {
      const res = await fetch(`/api/purchase-orders/${resolvedParams?.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received_quantity: quantity })
      })
      if (res.ok) {
        fetchOrderDetails()
      }
    } catch (error) {
      console.error('Error updating received quantity:', error)
    } finally {
      setUpdating(null)
    }
  }

  const openSerialModal = (item: OrderItem) => {
    setSelectedItem(item)
    // Pre-populate with empty serial numbers based on quantity
    const qtyToReceive = item.quantity - item.received_quantity
    setSerialNumbers(Array(Math.max(1, qtyToReceive)).fill(''))
    setShowSerialModal(true)
  }

  const closeSerialModal = () => {
    setShowSerialModal(false)
    setSelectedItem(null)
    setSerialNumbers([])
    setCsvContent('')
  }

  const addSerialNumber = () => {
    setSerialNumbers([...serialNumbers, ''])
  }

  const updateSerialNumber = (index: number, value: string) => {
    const updated = [...serialNumbers]
    updated[index] = value
    setSerialNumbers(updated)
  }

  const removeSerialNumber = (index: number) => {
    if (serialNumbers.length > 1) {
      setSerialNumbers(serialNumbers.filter((_, i) => i !== index))
    }
  }

  const saveSerialNumbers = async () => {
    if (!selectedItem) return

    let serialsToSave: string[] = []

    if (serialInputMode === 'bulk') {
      serialsToSave = serialNumbers.filter(s => s.trim() !== '')
    } else {
      serialsToSave = csvContent.split(/\n|,/).map(s => s.trim()).filter(s => s)
    }

    if (serialsToSave.length === 0) {
      alert('Please enter at least one serial number')
      return
    }

    const qtyToReceive = selectedItem.quantity - selectedItem.received_quantity
    if (serialsToSave.length > qtyToReceive) {
      alert(`You can only receive ${qtyToReceive} more items for this product`)
      return
    }

    setSavingSerials(true)
    try {
      // First, receive the items
      const receiveRes = await fetch(`/api/purchase-orders/${resolvedParams?.id}/items/${selectedItem.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quantity: serialsToSave.length,
          serial_numbers: serialsToSave
        })
      })

      if (receiveRes.ok) {
        closeSerialModal()
        fetchOrderDetails()
      } else {
        const error = await receiveRes.json()
        alert(error.error || 'Failed to receive items')
      }
    } catch (error) {
      console.error('Error saving serial numbers:', error)
      alert('Failed to save serial numbers')
    } finally {
      setSavingSerials(false)
    }
  }

  const handleReceiveAll = async () => {
    const itemsToReceive = items.filter(item => item.received_quantity < item.quantity)
    
    if (itemsToReceive.length === 0) {
      alert('All items have already been received')
      return
    }

    if (!confirm(`Receive ${itemsToReceive.length} item(s)?`)) return

    try {
      const res = await fetch(`/api/purchase-orders/${resolvedParams?.id}/receive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToReceive.map(item => ({
          item_id: item.id,
          quantity: item.quantity - item.received_quantity
        }))})
      })

      if (res.ok) {
        fetchOrderDetails()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to receive items')
      }
    } catch (error) {
      console.error('Error receiving items:', error)
      alert('Failed to receive items')
    }
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading order details...</p>
        </div>
      </SidebarLayout>
    )
  }

  if (!order) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Purchase order not found</p>
        </div>
      </SidebarLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      DRAFT: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      ORDERED: 'bg-blue-100 text-blue-700 border border-blue-200',
      PARTIAL: 'bg-orange-100 text-orange-700 border border-orange-200',
      RECEIVED: 'bg-green-100 text-green-700 border border-green-200',
      CANCELLED: 'bg-red-100 text-red-700 border border-red-200'
    }
    const statusLabels: Record<string, string> = {
      DRAFT: 'Draft',
      ORDERED: 'Ordered',
      PARTIAL: 'Partial',
      RECEIVED: 'Received',
      CANCELLED: 'Cancelled'
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusStyles[status]}`}>
        {statusLabels[status] || status}
      </span>
    )
  }

  const allReceived = items.every(item => item.received_quantity >= item.quantity)
  const canReceive = order.status !== 'CANCELLED' && order.status !== 'RECEIVED'

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/purchase-orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Purchase Orders
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
                {order.order_number}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                {getStatusBadge(order.status)}
                <span className="text-gray-500 text-sm">
                  Created: {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canReceive && (
                <button
                  onClick={handleReceiveAll}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Receive All
                </button>
              )}
              <Link
                href={`/purchase-orders/${order.id}/edit`}
                className="px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 border border-red-200 rounded-xl font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Order Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Order Information
              </h2>
              
              <div className="space-y-4">
                {order.supplier_name && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Truck className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Supplier</p>
                      <p className="text-gray-900 font-semibold">{order.supplier_name}</p>
                      {order.supplier_email && (
                        <p className="text-sm text-gray-500">{order.supplier_email}</p>
                      )}
                      {order.supplier_phone && (
                        <p className="text-sm text-gray-500">{order.supplier_phone}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {order.notes && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-2">Notes</p>
                    <p className="text-gray-900">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-600" />
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-bold text-gray-900">{items.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl">
                  <span className="font-semibold text-gray-900">Total Cost</span>
                  <span className="text-xl font-bold text-indigo-600">
                    ₹{Number(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {allReceived && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">All items received</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Order Items
            </h2>
          </div>
          
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No items in this order</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Unit Cost</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Received</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{item.product_name}</span>
                            {item.product_sku && (
                              <span className="text-sm text-gray-500 block">{item.product_sku}</span>
                            )}
                            {item.has_serial_numbers && (
                              <span className="inline-flex items-center gap-1 text-xs text-indigo-600 mt-1">
                                <Tag className="w-3 h-3" />
                                Serial Tracked
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">{item.quantity}</td>
                      <td className="px-6 py-4 text-gray-600">
                        ₹{Number(item.unit_cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">
                        ₹{Number(item.total_cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={item.received_quantity}
                            onChange={(e) => updateReceivedQuantity(item.id, parseInt(e.target.value) || 0)}
                            disabled={updating === item.id || !canReceive}
                            className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100"
                          />
                          <span className="text-gray-500">/ {item.quantity}</span>
                          {item.received_quantity >= item.quantity && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {canReceive && item.received_quantity < item.quantity && (
                          <button
                            onClick={() => openSerialModal(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                          >
                            <Tag className="w-4 h-4" />
                            Add Serials
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Serial Numbers Modal */}
      {showSerialModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Serial Numbers</h2>
                <p className="text-sm text-gray-500">{selectedItem.product_name}</p>
              </div>
              <button
                onClick={closeSerialModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-indigo-900">
                  <span className="font-semibold">Quantity to receive:</span>{' '}
                  {selectedItem.quantity - selectedItem.received_quantity} items
                </p>
              </div>

              {/* Input Mode Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setSerialInputMode('bulk')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    serialInputMode === 'bulk'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bulk Entry
                </button>
                <button
                  type="button"
                  onClick={() => setSerialInputMode('csv')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    serialInputMode === 'csv'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  CSV Import
                </button>
              </div>

              {serialInputMode === 'bulk' && (
                <div className="space-y-2">
                  {serialNumbers.map((serial, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={serial}
                        onChange={(e) => updateSerialNumber(index, e.target.value)}
                        placeholder={`Serial number ${index + 1}`}
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeSerialNumber(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSerialNumber}
                    className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Serial Number
                  </button>
                </div>
              )}

              {serialInputMode === 'csv' && (
                <div>
                  <textarea
                    value={csvContent}
                    onChange={(e) => setCsvContent(e.target.value)}
                    placeholder={`Paste serial numbers here, separated by commas or new lines...\n\nExample:\nSN001, SN002, SN003\nSN004\nSN005`}
                    rows={8}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-mono"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter serial numbers separated by commas or each on a new line
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeSerialModal}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSerialNumbers}
                disabled={savingSerials}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingSerials ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save & Receive
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
