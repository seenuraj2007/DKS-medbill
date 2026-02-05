'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Truck, Mail, Phone, User, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionGate } from '@/components/SubscriptionGate'

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

export default function SupplierFormPage({ params }: { params?: Promise<{ id?: string }> }) {
  const resolvedParams = params ? use(params) : undefined
  const router = useRouter()
  const isEdit = !!resolvedParams?.id
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    notes: ''
  })

  useEffect(() => {
    if (isEdit) {
      fetchSupplier()
    }
  }, [resolvedParams?.id])

  const fetchSupplier = async () => {
    try {
      const res = await fetch(`/api/suppliers/${resolvedParams?.id}`)
      if (!res.ok) throw new Error('Failed to fetch supplier')
      const data = await res.json()
      const supplier = data.supplier
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        zip: supplier.zip || '',
        country: supplier.country || '',
        notes: supplier.notes || ''
      })
    } catch (err) {
      setError('Failed to load supplier')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = isEdit ? `/api/suppliers/${resolvedParams?.id}` : '/api/suppliers'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save supplier')
      }

      router.push('/suppliers')
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
              <Link href="/suppliers" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">StockAlert</span>
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link
              href="/suppliers"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Suppliers
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Edit Supplier' : 'Add New Supplier'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEdit ? 'Update supplier information' : 'Add a new supplier'}
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
                  label="Supplier Name"
                  icon={Truck}
                  name="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Acme Supplies"
                  required
                />

                <InputField
                  label="Contact Person"
                  icon={User}
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="John Doe"
                />

                <InputField
                  label="Email"
                  icon={Mail}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="supplier@example.com"
                />

                <InputField
                  label="Phone"
                  icon={Phone}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main St"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900"
                      />
                    </div>
                  </div>

                  <InputField
                    label="City"
                    icon={MapPin}
                    name="city"
                    value={formData.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                  />

                  <InputField
                    label="State"
                    icon={MapPin}
                    name="state"
                    value={formData.state}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="NY"
                  />

                  <InputField
                    label="ZIP Code"
                    icon={MapPin}
                    name="zip"
                    value={formData.zip}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, zip: e.target.value })}
                    placeholder="10001"
                  />

                  <InputField
                    label="Country"
                    icon={MapPin}
                    name="country"
                    value={formData.country}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="USA"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this supplier..."
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <Link
                  href="/suppliers"
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
                  {loading ? 'Saving...' : (isEdit ? 'Update Supplier' : 'Add Supplier')}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </SubscriptionGate>
  )
}
