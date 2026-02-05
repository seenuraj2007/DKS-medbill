'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, Tag, Hash, AlertTriangle, Mail, Phone, DollarSign, Box, Scan } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ImageUpload from '@/components/ImageUpload'
import { SubscriptionGate } from '@/components/SubscriptionGate'
import { useUpgradeToast } from '@/components/UpgradeNotification'

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
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 bg-white"
      />
    </div>
  </div>
)

export default function ProductFormPage({ params }: { params?: Promise<{ id?: string }> }) {
  const resolvedParams = params ? use(params) : undefined
  const router = useRouter()
  const { showLimitReached } = useUpgradeToast()
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
        
        // Check if it's a limit reached error
        if (res.status === 403 && data.limit !== undefined) {
          showLimitReached('products', data.current, data.limit)
          setError(`Product limit reached. Please upgrade your plan to add more products.`)
          return
        }
        
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading product details...</p>
        </div>
      </div>
    )
  }

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/products" className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">DKS StockAlert</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all text-sm font-medium mb-4 cursor-pointer"
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

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Product Information</h3>
                  <p className="text-sm text-gray-500">Basic details about your product</p>
                </div>
              </div>

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
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                    Barcode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="1234567890123"
                      className="w-full pl-11 pr-12 py-3.5 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md focus:bg-white text-gray-900 cursor-text"
                    />
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
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

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Box className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Product Image</h3>
                    <p className="text-sm text-gray-500">Upload a product image</p>
                  </div>
                </div>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  onRemove={() => setFormData({ ...formData, image_url: '' })}
                />
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Supplier Information</h3>
                    <p className="text-sm text-gray-500">Contact details for suppliers</p>
                  </div>
                </div>
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
                  className="px-6 py-3.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {isEdit ? 'Update Product' : 'Add Product'}
                    </>
                  )}
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
    </SubscriptionGate>
  )
}
