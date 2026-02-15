'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Truck, Mail, Phone, MapPin, Edit, Trash2, Package, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface Supplier {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  total_products: number
  created_at: string
  updated_at: string
}

interface SupplierProduct {
  id: string
  name: string
  sku: string | null
  current_quantity: number
  unit_cost: number | null
  selling_price: number | null
}

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [products, setProducts] = useState<SupplierProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSupplier()
    fetchProducts()
  }, [resolvedParams.id])

  const fetchSupplier = async () => {
    try {
      const res = await fetch(`/api/suppliers/${resolvedParams.id}`)
      if (!res.ok) throw new Error('Failed to fetch supplier')
      const data = await res.json()
      setSupplier(data.supplier)
    } catch (err) {
      setError('Failed to load supplier')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/suppliers/${resolvedParams.id}/products`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/suppliers/${resolvedParams.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/suppliers')
      }
    } catch (err) {
      setError('Failed to delete supplier')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Truck className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading supplier...</p>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Supplier not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/suppliers" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href={`/suppliers/${supplier.id}/edit`}
                className="p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                title="Edit supplier"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={handleDelete}
                className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                title="Delete supplier"
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
            href="/suppliers"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition-all text-sm font-medium mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Suppliers
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
          {supplier.contact_person && (
            <p className="text-gray-500 mt-1">Contact: {supplier.contact_person}</p>
          )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Supplier Information</h2>
                  <p className="text-sm text-gray-500">Contact and address details</p>
                </div>
              </div>
              <div className="space-y-5">
                {supplier.contact_person && (
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 flex-shrink-0">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                      <p className="font-semibold text-gray-900">{supplier.contact_person}</p>
                    </div>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-100 flex-shrink-0">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <a
                        href={`mailto:${supplier.email}`}
                        className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {supplier.email}
                      </a>
                    </div>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 flex-shrink-0">
                      <Phone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <a
                        href={`tel:${supplier.phone}`}
                        className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        {supplier.phone}
                      </a>
                    </div>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100 flex-shrink-0">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="font-semibold text-gray-900">{supplier.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Products</h2>
                    <p className="text-sm text-gray-500">Associated products</p>
                  </div>
                </div>
                <Link
                  href={`/products/new?supplier_id=${supplier.id}`}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center gap-2 text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  Add Product
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Package className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No products yet</p>
                  <p className="text-sm text-gray-500 mt-1">Add products to this supplier</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/products/${product.id}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-100">
                                <Package className="w-5 h-5 text-indigo-600" />
                              </div>
                              <span className="font-medium text-gray-900">{product.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {product.sku || '-'}
                          </td>
                          <td className="px-6 py-4 text-gray-600 text-sm">
                            {product.current_quantity}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 text-sm font-medium">
                            ${Number(product.unit_cost || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Statistics</h3>
                  <p className="text-sm text-gray-500">Overview</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <p className="text-sm text-indigo-600 mb-1 font-medium">Total Products</p>
                  <p className="text-3xl font-bold text-indigo-900">{supplier.total_products}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Details</h3>
                  <p className="text-sm text-gray-500">Metadata</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-gray-900">{new Date(supplier.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium text-gray-900">{new Date(supplier.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {supplier.notes && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Notes</h3>
                    <p className="text-sm text-gray-500">Additional info</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{supplier.notes}</p>
              </div>
            )}

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="font-medium">Quick Actions</span>
                <ArrowUpRight className="w-5 h-5 opacity-50" />
              </div>
              <div className="mt-4 space-y-2">
                <Link
                  href={`/purchase-orders/new?supplier_id=${supplier.id}`}
                  className="block bg-white/20 hover:bg-white/30 rounded-xl px-4 py-3 text-sm transition-colors cursor-pointer"
                >
                  Create Purchase Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
