'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, Tag, Hash, AlertTriangle, Mail, Phone, DollarSign, Box, Scan, Clock, Scale, Info, Search, CheckCircle, XCircle, Loader2, Pill, Thermometer, FileText, Building2 } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ImageUpload from '@/components/ImageUpload'
import { SubscriptionGate } from '@/components/SubscriptionGate'
import { useUpgradeToast, ToastProvider } from '@/components/UpgradeNotification'
import { MEDICAL_UNIT_OPTIONS, DRUG_SCHEDULE_OPTIONS, STORAGE_TEMP_OPTIONS, MEDICINE_HSN_CODES, MEDICINE_CATEGORIES } from '@/lib/medical-constants'

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), {
  ssr: false,
  loading: () => <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
})

const InputField = ({ label, icon: Icon, type = 'text', name, value, onChange, placeholder, required = false, min, step }: any) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 bg-white"
      />
    </div>
  </div>
)

export default function ProductFormPage({ params }: { params?: Promise<{ id?: string }> }) {
  return (
    <ToastProvider>
      <ProductFormContent params={params} />
    </ToastProvider>
  )
}

function ProductFormContent({ params }: { params?: Promise<{ id?: string }> }) {
  const resolvedParams = use(params || Promise.resolve({ id: undefined }))
  const router = useRouter()
  const { showLimitReached } = useUpgradeToast()
  const isEdit = !!resolvedParams?.id
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [barcodeLookupLoading, setBarcodeLookupLoading] = useState(false)
  const [barcodeLookupResult, setBarcodeLookupResult] = useState<{found: boolean, message?: string, source?: string | null} | null>(null)

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
    unit: 'strip',
    image_url: '',
    // Perishable fields
    is_perishable: true,
    expiry_date: '',
    weight_per_unit: '1',
    min_weight: '',
    // Medical-specific fields
    max_retail_price: '',
    composition: '',
    manufacturer: '',
    drug_schedule: 'OTC',
    storage_temp: 'ROOM_TEMP',
    requires_prescription: false,
    units_per_strip: '10',
    strips_per_box: '10',
    hsn_code: '3004',
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
        current_quantity: product.current_quantity?.toString() || '',
        reorder_point: product.reorder_point?.toString() || '',
        supplier_name: product.supplier_name || '',
        supplier_email: product.supplier_email || '',
        supplier_phone: product.supplier_phone || '',
        unit_cost: product.unit_cost?.toString() || '',
        selling_price: product.selling_price?.toString() || '',
        unit: product.unit || 'strip',
        image_url: product.image_url || '',
        is_perishable: product.is_perishable ?? true,
        expiry_date: product.expiry_date ? product.expiry_date.split('T')[0] : '',
        weight_per_unit: product.weight_per_unit?.toString() || '1',
        min_weight: product.min_weight?.toString() || '',
        // Medical fields
        max_retail_price: product.max_retail_price?.toString() || '',
        composition: product.composition || '',
        manufacturer: product.manufacturer || '',
        drug_schedule: product.drug_schedule || 'OTC',
        storage_temp: product.storage_temp || 'ROOM_TEMP',
        requires_prescription: product.requires_prescription || false,
        units_per_strip: product.units_per_strip?.toString() || '10',
        strips_per_box: product.strips_per_box?.toString() || '10',
        hsn_code: product.hsn_code || '3004',
      })
    } catch (err) {
      setError('Failed to load product')
    } finally {
      setFetching(false)
    }
  }

  const handleBarcodeDetected = (code: string) => {
    setShowScanner(false)
    setFormData({ ...formData, barcode: code })
    setTimeout(() => lookupBarcode(code), 500)
  }

  const lookupBarcode = async (barcode: string) => {
    if (!barcode || barcode.length < 8) return
    
    setBarcodeLookupLoading(true)
    setBarcodeLookupResult(null)
    
    try {
      const res = await fetch('/api/products/lookup-barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode })
      })
      
      const data = await res.json()
      
      if (data.found) {
        if (data.source === 'local') {
          setBarcodeLookupResult({
            found: true,
            message: 'This product already exists in your inventory!',
            source: 'local'
          })
          setFormData(prev => ({
            ...prev,
            name: data.product.name || prev.name,
            category: data.product.category || prev.category,
            unit: data.product.unit || prev.unit,
            selling_price: data.product.sellingPrice?.toString() || prev.selling_price,
            unit_cost: data.product.unitCost?.toString() || prev.unit_cost,
            image_url: data.product.imageUrl || prev.image_url,
            max_retail_price: data.product.maxRetailPrice?.toString() || prev.max_retail_price,
            composition: data.product.composition || prev.composition,
            manufacturer: data.product.manufacturer || prev.manufacturer,
            drug_schedule: data.product.drugSchedule || prev.drug_schedule,
            requires_prescription: data.product.requiresPrescription || prev.requires_prescription,
          }))
        } else if (data.source === 'medicine-database') {
          setBarcodeLookupResult({
            found: true,
            message: `Found: ${data.product.name}`,
            source: 'medicine-database'
          })
          
          setFormData(prev => ({
            ...prev,
            name: data.product.name || prev.name,
            category: data.product.category || prev.category,
            unit: data.product.unit || prev.unit,
            composition: data.product.composition || prev.composition,
            manufacturer: data.product.manufacturer || prev.manufacturer,
            max_retail_price: data.product.maxRetailPrice?.toString() || prev.max_retail_price,
            drug_schedule: data.product.drugSchedule || prev.drug_schedule,
            requires_prescription: data.product.requiresPrescription || prev.requires_prescription,
            hsn_code: data.product.hsnCode || prev.hsn_code,
          }))
        }
      } else {
        setBarcodeLookupResult({
          found: false,
          message: 'Product not found. Please enter details manually.',
          source: null
        })
      }
    } catch (err) {
      console.error('Barcode lookup error:', err)
      setBarcodeLookupResult({
        found: false,
        message: 'Failed to lookup barcode. Please enter details manually.',
        source: null
      })
    } finally {
      setBarcodeLookupLoading(false)
    }
  }

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const barcode = e.target.value
    setFormData({ ...formData, barcode })
    
    if (barcode.length >= 8 && !isEdit) {
      setBarcodeLookupLoading(true)
      setBarcodeLookupResult(null)
      setTimeout(() => lookupBarcode(barcode), 800)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload = {
        ...formData,
        current_quantity: formData.current_quantity ? parseInt(formData.current_quantity) || 0 : 0,
        reorder_point: formData.reorder_point ? parseInt(formData.reorder_point) || 0 : 0,
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) || 0 : 0,
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) || 0 : 0,
        max_retail_price: formData.max_retail_price ? parseFloat(formData.max_retail_price) || null : null,
        weight_per_unit: formData.weight_per_unit ? parseFloat(formData.weight_per_unit) || 1 : 1,
        min_weight: formData.min_weight ? parseFloat(formData.min_weight) || null : null,
        expiry_date: formData.expiry_date || null,
        units_per_strip: formData.units_per_strip ? parseInt(formData.units_per_strip) || null : null,
        strips_per_box: formData.strips_per_box ? parseInt(formData.strips_per_box) || null : null,
        gst_rate: MEDICINE_HSN_CODES.find(h => h.code === formData.hsn_code)?.gstRate || 12,
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
                <span className="text-xl font-bold text-gray-900">DKS MedBill</span>
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
              {isEdit ? 'Edit Medicine' : 'Add New Medicine'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEdit ? 'Update medicine information' : 'Add a new medicine to your inventory'}
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
              {/* Basic Information */}
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Basic Information</h3>
                  <p className="text-sm text-gray-500">Medicine details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Medicine Name"
                  icon={Package}
                  name="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Paracetamol 500mg"
                  required
                />

                <InputField
                  label="SKU"
                  icon={Hash}
                  name="sku"
                  value={formData.sku}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="MED-123"
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                    Barcode
                    {barcodeLookupLoading && (
                      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    )}
                    {barcodeLookupResult?.found && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {barcodeLookupResult && !barcodeLookupResult.found && (
                      <XCircle className="w-4 h-4 text-orange-500" />
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash className="w-5 h-5 text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleBarcodeChange}
                      placeholder="8901234567890"
                      className={`w-full pl-11 pr-24 py-3.5 border rounded-xl focus:ring-4 outline-none transition-all bg-gray-50/50 hover:bg-white hover:shadow-md focus:bg-white text-gray-900 cursor-text ${
                        barcodeLookupResult?.found 
                          ? 'border-green-500 focus:border-green-500 focus:ring-green-500/10' 
                          : barcodeLookupResult && !barcodeLookupResult.found
                          ? 'border-orange-500 focus:border-orange-500 focus:ring-orange-500/10'
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10'
                      }`}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => formData.barcode && lookupBarcode(formData.barcode)}
                        disabled={!formData.barcode || formData.barcode.length < 8 || barcodeLookupLoading}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Lookup barcode"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="p-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Scan barcode"
                      >
                        <Scan className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {barcodeLookupResult && (
                    <div className={`mt-2 text-sm flex items-center gap-2 ${
                      barcodeLookupResult.found ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {barcodeLookupResult.found ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                      <span>{barcodeLookupResult.message}</span>
                      {barcodeLookupResult.source === 'medicine-database' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Auto-filled
                        </span>
                      )}
                      {barcodeLookupResult.source === 'local' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          In Inventory
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none"
                    >
                      <option value="">Select category...</option>
                      {MEDICINE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit
                  </label>
                  <div className="relative">
                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none"
                    >
                      {MEDICAL_UNIT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pharmaceutical Information */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Pill className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pharmaceutical Information</h3>
                    <p className="text-sm text-gray-500">Composition, manufacturer, and regulatory details</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Composition / Active Ingredients
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <textarea
                        name="composition"
                        value={formData.composition}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, composition: e.target.value })}
                        placeholder="e.g., Paracetamol IP 500mg"
                        rows={2}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white resize-none"
                      />
                    </div>
                  </div>

                  <InputField
                    label="Manufacturer"
                    icon={Building2}
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g., Cipla Ltd."
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Drug Schedule
                    </label>
                    <div className="relative">
                      <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <select
                        name="drug_schedule"
                        value={formData.drug_schedule}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                          const schedule = e.target.value
                          const requiresRx = ['SCHEDULE_H', 'SCHEDULE_H1', 'SCHEDULE_X'].includes(schedule)
                          setFormData({ 
                            ...formData, 
                            drug_schedule: schedule,
                            requires_prescription: requiresRx
                          })
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none"
                      >
                        {DRUG_SCHEDULE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Storage Temperature
                    </label>
                    <div className="relative">
                      <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <select
                        name="storage_temp"
                        value={formData.storage_temp}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, storage_temp: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none"
                      >
                        {STORAGE_TEMP_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <input
                      type="checkbox"
                      id="requires_prescription"
                      name="requires_prescription"
                      checked={formData.requires_prescription}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, requires_prescription: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="requires_prescription" className="text-sm font-medium text-gray-700">
                      Requires Prescription
                      {formData.requires_prescription && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                          Rx Required
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
                    <InputField
                      label="Units per Strip"
                      icon={Box}
                      type="number"
                      name="units_per_strip"
                      value={formData.units_per_strip}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, units_per_strip: e.target.value })}
                      placeholder="10"
                      min="1"
                    />

                    <InputField
                      label="Strips per Box"
                      icon={Box}
                      type="number"
                      name="strips_per_box"
                      value={formData.strips_per_box}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, strips_per_box: e.target.value })}
                      placeholder="10"
                      min="1"
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        HSN Code
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <select
                          name="hsn_code"
                          value={formData.hsn_code}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, hsn_code: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 bg-white appearance-none"
                        >
                          {MEDICINE_HSN_CODES.map((hsn) => (
                            <option key={hsn.code} value={hsn.code}>
                              {hsn.code} ({hsn.gstRate}% GST)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Pricing</h3>
                    <p className="text-sm text-gray-500">Cost and selling price</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="Unit Cost (₹)"
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
                    label="MRP (₹)"
                    icon={DollarSign}
                    type="number"
                    step="0.01"
                    name="max_retail_price"
                    value={formData.max_retail_price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, max_retail_price: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    required
                  />

                  <InputField
                    label="Selling Price (₹)"
                    icon={DollarSign}
                    type="number"
                    step="0.01"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, selling_price: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Stock & Expiry */}
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Stock & Expiry</h3>
                    <p className="text-sm text-gray-500">Inventory management</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <input
                      type="checkbox"
                      id="is_perishable"
                      name="is_perishable"
                      checked={formData.is_perishable}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_perishable: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="is_perishable" className="text-sm font-medium text-gray-700">
                      Track expiry date
                    </label>
                  </div>

                  {formData.is_perishable && (
                    <InputField
                      label="Expiry Date"
                      icon={Clock}
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  )}
                </div>
              </div>

              {/* Product Image */}
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

              {/* Supplier Information */}
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
                    placeholder="e.g., Cipla Distributors"
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
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
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
                      {isEdit ? 'Update Medicine' : 'Add Medicine'}
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
