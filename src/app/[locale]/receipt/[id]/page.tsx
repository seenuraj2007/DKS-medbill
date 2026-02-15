'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Package, AlertCircle, Download, Share2 } from 'lucide-react'

interface ReceiptItem {
  description: string
  quantity: number
  unitPrice: number
  totalAmount: number
}

interface ReceiptData {
  invoiceNumber: string
  invoiceDate: string
  items: ReceiptItem[]
  subtotal: number
  totalAmount: number
  paymentMethod: string | null
  expiresAt: string
}

export default function ReceiptPage() {
  const params = useParams()
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReceipt()
  }, [params.id])

  const fetchReceipt = async () => {
    try {
      console.log('Fetching receipt for ID:', params.id)
      const res = await fetch(`/api/receipt/${params.id}`)
      console.log('API response status:', res.status)
      if (!res.ok) {
        const errorText = await res.text()
        console.error('API error:', errorText)
        throw new Error(`Receipt not found or expired (${res.status})`)
      }
      const data = await res.json()
      console.log('Receipt data received:', data)
      setReceipt(data.receipt)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load receipt')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${receipt?.invoiceNumber}`,
          text: `Receipt for ₹${receipt?.totalAmount.toFixed(2)}`,
          url: window.location.href
        })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    )
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-md shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Receipt Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This receipt may have expired or been removed.'}</p>
          <p className="text-sm text-gray-500 mb-4">Receipts are available for 1 year from the date of purchase.</p>
          <p className="text-xs text-gray-400">ID: {params.id}</p>
        </div>
      </div>
    )
  }

  const isExpired = new Date(receipt.expiresAt) < new Date()

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="w-6 h-6" />
            <span className="font-bold text-lg">Receipt</span>
          </div>
          <p className="text-center text-white/80 text-sm">{receipt.invoiceNumber}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Date */}
          <div className="text-center mb-6 pb-6 border-b border-gray-100">
            <p className="text-gray-500 text-sm">Date</p>
            <p className="font-medium text-gray-900">
              {new Date(receipt.invoiceDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            {isExpired && (
              <p className="text-amber-600 text-xs mt-1">This receipt has expired</p>
            )}
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Items</h3>
            {receipt.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 pr-4">
                  <p className="font-medium text-gray-900 text-sm">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  ₹{item.totalAmount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          {receipt.paymentMethod && (
            <div className="flex justify-between items-center py-3 border-t border-gray-100">
              <span className="text-gray-600 text-sm">Payment Method</span>
              <span className="font-semibold text-gray-900 capitalize bg-gray-100 px-3 py-1 rounded-full text-sm">
                {receipt.paymentMethod === 'cash' ? '💵 Cash' : 
                 receipt.paymentMethod === 'upi' ? '📱 UPI' : 
                 receipt.paymentMethod === 'credit' ? '📋 Credit' : 
                 receipt.paymentMethod}
              </span>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">₹{receipt.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
              <span className="text-gray-900">Total</span>
              <span className="text-indigo-600">₹{receipt.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Expiry Notice */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Valid until: {new Date(receipt.expiresAt).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 print:hidden">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Print / Save
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-400 text-xs mt-6">
        Powered by DKS StockAlert
      </p>
    </div>
  )
}
