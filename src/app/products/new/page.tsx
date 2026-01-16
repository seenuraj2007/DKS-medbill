'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, Tag, Hash, AlertTriangle, Mail, Phone, DollarSign, Box, Scan } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ImageUpload from '@/components/ImageUpload'

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), {
  ssr: false,
  loading: () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
})

const InputField = ({ label, icon: Icon, type = 'text', name, value, onChange, placeholder, required = false }: any) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
      />
    </div>
  </div>
)

export default function ProductFormPage({ params }: { params?: Promise<{ id?: string }> }) {
  const resolvedParams = params ? use(params) : undefined
  const router = useRouter()
  const isEdit = !!resolvedParams?.id
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [showScanner, setShowScanner] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    current_quantity: '',
    reorder_point: '',
    supplier_name: '',
    supplier_email: '',
    supplier_phone: '',
    unit_cost: '',
    selling_price: '',
    unit: '',
    image_url: ''
  })

  useEffect(() => {
    if (isEdit) {
      fetchProduct()
    }
  }, [resolvedParams?.id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${resolvedParams?.id}`)
      if (!res.ok) throw new Error('Failed to fetch product')
      const data = await res.json()
      const product = data.product
      setFormData({
        name: product.name,
        sku: product.sku || '',
        barcode: product.barcode || '',
        category: product.category || '',
        current_quantity: product.current_quantity.toString(),
        reorder_point: product.reorder_point.toString(),
        supplier_name: product.supplier_name || '',
        supplier_email: product.supplier_email || '',
        supplier_phone: product.supplier_phone || '',
        unit_cost: product.unit_cost?.toString() || '',
        selling_price: product.selling_price?.toString() || '',
        unit: product.unit || '',
        image_url: product.image_url || ''
      })
    } catch (err) {
      setError('Failed to load product')
    } finally {
      setFetching(false)
    }
  }

  const handleBarcodeDetected = (code: string) => {
    setFormData({ ...formData, barcode: code })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        current_quantity: formData.current_quantity ? parseInt(formData.current_quantity) : 0,
        reorder_point: formData.reorder_point ? parseInt(formData.reorder_point) : 0,
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : 0,
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) : 0
      }

      const url = isEdit ? `/api/products/${resolvedParams?.id}` : '/api/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save product')
      }

      router.push('/products')
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
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEdit ? 'Update product information' : 'Add a new product to your inventory'}
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
              <InputField
                label="Product Name"
                icon={Package}
                name="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
                required
              />

              <InputField
                label="SKU"
                icon={Hash}
                name="sku"
                value={formData.sku}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-123"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Barcode
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="1234567890123"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    <Scan className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <InputField
                label="Category"
                icon={Tag}
                name="category"
                value={formData.category}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Electronics"
              />

              <InputField
                label="Unit"
                icon={Box}
                name="unit"
                value={formData.unit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="pcs, kg, liters"
              />

              <InputField
                label="Current Quantity"
                icon={Package}
                type="number"
                name="current_quantity"
                value={formData.current_quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, current_quantity: e.target.value })}
                placeholder="0"
                min="0"
              />

              <InputField
                label="Reorder Point"
                icon={AlertTriangle}
                type="number"
                name="reorder_point"
                value={formData.reorder_point}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, reorder_point: e.target.value })}
                placeholder="10"
                min="0"
              />

              <InputField
                label="Unit Cost ($)"
                icon={DollarSign}
                type="number"
                step="0.01"
                name="unit_cost"
                value={formData.unit_cost}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, unit_cost: e.target.value })}
                placeholder="0.00"
                min="0"
              />

              <InputField
                label="Selling Price ($)"
                icon={DollarSign}
                type="number"
                step="0.01"
                name="selling_price"
                value={formData.selling_price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, selling_price: e.target.value })}
                placeholder="0.00"
                min="0"
              />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                onRemove={() => setFormData({ ...formData, image_url: '' })}
              />
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Supplier Name"
                icon={Package}
                name="supplier_name"
                value={formData.supplier_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, supplier_name: e.target.value })}
                placeholder="Acme Supplies"
              />

              <InputField
                label="Supplier Email"
                icon={Mail}
                type="email"
                name="supplier_email"
                value={formData.supplier_email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, supplier_email: e.target.value })}
                placeholder="supplier@example.com"
              />

              <InputField
                label="Supplier Phone"
                icon={Phone}
                type="tel"
                name="supplier_phone"
                value={formData.supplier_phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, supplier_phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4">
              <Link
                href="/products"
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
                {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>
        </div>
      </main>

      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
