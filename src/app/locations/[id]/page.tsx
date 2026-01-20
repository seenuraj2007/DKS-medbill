'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Box, Edit, ArrowUpRight, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ProductStock {
  product_id: number
  product_name: string
  product_sku: string | null
  quantity: number
  updated_at: string
}

interface Location {
  id: number
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  is_primary: number
  created_at: string
  updated_at: string
}

export default function LocationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [location, setLocation] = useState<Location | null>(null)
  const [products, setProducts] = useState<ProductStock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocationDetails()
  }, [resolvedParams?.id])

  const fetchLocationDetails = async () => {
    try {
      const [locRes, prodRes] = await Promise.all([
        fetch(`/api/locations/${resolvedParams?.id}`),
        fetch(`/api/locations/${resolvedParams?.id}/products`)
      ])
      
      if (locRes.ok) {
        const locData = await locRes.json()
        setLocation(locData.location)
      }
      
      if (prodRes.ok) {
        const prodData = await prodRes.json()
        setProducts(prodData.products || [])
      }
    } catch (error) {
      console.error('Error fetching location details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      const res = await fetch(`/api/locations/${resolvedParams?.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/locations')
      }
    } catch (error) {
      console.error('Error deleting location:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Location not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/locations" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StockAlert</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/locations"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Locations
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="w-8 h-8 text-indigo-600" />
                {location.name}
              </h1>
              {location.is_primary && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 mt-2">
                  Primary Location
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/locations/${location.id}/edit`}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 rounded-lg font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h2>
              <div className="space-y-3">
                {location.address && (
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">{location.address}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {location.city && (
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="text-gray-900">{location.city}</p>
                    </div>
                  )}
                  {location.state && (
                    <div>
                      <p className="text-sm text-gray-500">State</p>
                      <p className="text-gray-900">{location.state}</p>
                    </div>
                  )}
                  {location.zip && (
                    <div>
                      <p className="text-sm text-gray-500">ZIP Code</p>
                      <p className="text-gray-900">{location.zip}</p>
                    </div>
                  )}
                  {location.country && (
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="text-gray-900">{location.country}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Box className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm text-gray-600">Total Products</span>
                  </div>
                  <span className="font-semibold text-gray-900">{products.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Products at This Location</h2>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Box className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No products found at this location</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{product.product_name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {product.product_sku || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{product.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/products/${product.product_id}`)}
                          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
