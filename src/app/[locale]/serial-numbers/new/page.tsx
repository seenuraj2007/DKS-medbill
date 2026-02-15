'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, Trash2, Upload, Loader2,
  Package, Tag, Calendar, DollarSign, FileText
} from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

interface Product {
  id: string
  name: string
  sku: string
  imageUrl: string | null
}

interface Location {
  id: string
  name: string
}

interface Batch {
  id: string
  batchNumber: string
}

export default function NewSerialNumberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')
  const [warrantyMonths, setWarrantyMonths] = useState(12)
  const [unitCost, setUnitCost] = useState('')
  const [notes, setNotes] = useState('')
  
  // Serial numbers input
  const [inputMode, setInputMode] = useState<'single' | 'bulk' | 'csv'>('bulk')
  const [serialNumbers, setSerialNumbers] = useState<string[]>([''])
  const [csvContent, setCsvContent] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchLocations()
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      fetchBatches(selectedProduct)
    }
  }, [selectedProduct])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations')
      if (res.ok) {
        const data = await res.json()
        setLocations(data.locations || [])
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const fetchBatches = async (productId: string) => {
    try {
      const res = await fetch(`/api/batches?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        setBatches(data.batches || [])
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    }
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
    if (serialNumbers.length === 1) {
      setSerialNumbers([''])
    } else {
      setSerialNumbers(serialNumbers.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct) {
      alert('Please select a product')
      return
    }

    let serialsToCreate: { serialNumber: string; unitCost?: number; notes?: string }[] = []

    if (inputMode === 'single') {
      if (!serialNumbers[0]) {
        alert('Please enter a serial number')
        return
      }
      serialsToCreate = [{ serialNumber: serialNumbers[0] }]
    } else if (inputMode === 'bulk') {
      const validSerials = serialNumbers.filter(s => s.trim() !== '')
      if (validSerials.length === 0) {
        alert('Please enter at least one serial number')
        return
      }
      serialsToCreate = validSerials.map(serial => ({ serialNumber: serial.trim() }))
    } else if (inputMode === 'csv') {
      const lines = csvContent.split(/\n|,/).map(s => s.trim()).filter(s => s)
      if (lines.length === 0) {
        alert('Please enter serial numbers in CSV format')
        return
      }
      serialsToCreate = lines.map(serial => ({ serialNumber: serial }))
    }

    setLoading(true)

    try {
      const res = await fetch('/api/serial-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          batchId: selectedBatch || undefined,
          stockLevelId: selectedLocation || undefined,
          serialNumbers: serialsToCreate,
          warrantyMonths,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`${data.serialNumbers?.length || serialsToCreate.length} serial numbers created successfully!`)
        router.push('/serial-numbers')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create serial numbers')
      }
    } catch (error) {
      console.error('Error creating serial numbers:', error)
      alert('Failed to create serial numbers')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/serial-numbers"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Serial Numbers
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Serial Numbers</h1>
          <p className="text-gray-500 mt-1">Create new serial numbers for tracking individual items</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Product Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="">Select a product...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Optional)
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  >
                    <option value="">Select location...</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch (Optional)
                  </label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    disabled={!selectedProduct}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Select batch...</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty (Months)
                  </label>
                  <input
                    type="number"
                    value={warrantyMonths}
                    onChange={(e) => setWarrantyMonths(parseInt(e.target.value) || 0)}
                    min="0"
                    max="120"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Cost (Optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="number"
                      step="0.01"
                      value={unitCost}
                      onChange={(e) => setUnitCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Serial Numbers Input */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600" />
              Serial Numbers
            </h2>

            {/* Input Mode Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setInputMode('bulk')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === 'bulk'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Bulk Entry
              </button>
              <button
                type="button"
                onClick={() => setInputMode('single')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === 'single'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Single Entry
              </button>
              <button
                type="button"
                onClick={() => setInputMode('csv')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputMode === 'csv'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                CSV Import
              </button>
            </div>

            {inputMode === 'bulk' && (
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
                      title="Remove"
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

            {inputMode === 'single' && (
              <div>
                <input
                  type="text"
                  value={serialNumbers[0]}
                  onChange={(e) => updateSerialNumber(0, e.target.value)}
                  placeholder="Enter serial number"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-mono"
                />
              </div>
            )}

            {inputMode === 'csv' && (
              <div>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="Paste serial numbers here, separated by commas or new lines...&#10;&#10;Example:&#10;SN001, SN002, SN003&#10;SN004&#10;SN005"
                  rows={6}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-mono"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter serial numbers separated by commas or each on a new line
                </p>
              </div>
            )}

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information about these serial numbers..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/serial-numbers"
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !selectedProduct}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Serial Numbers
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  )
}
