'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, MapPin, Edit, Trash2, ArrowUpRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { get, del } from '@/lib/fetch'
import { SubscriptionGate } from '@/components/SubscriptionGate'
import SidebarLayout from '@/components/SidebarLayout'

interface Location {
  id: number
  name: string
  address: string | null
  city: string | null
  state: string | null
  is_primary: number
  total_products: number
  created_at: string
}

export default function LocationsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const res = await get('/api/locations')
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      const data = await res.json()
      setLocations(data.locations)
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this location?')) return

    const previousLocations = [...locations]
    setLocations(locations.filter(l => l.id !== id))

    try {
      const res = await del(`/api/locations/${id}`)
      if (!res.ok) {
        setLocations(previousLocations)
      }
    } catch (error) {
      console.error('Error deleting location:', error)
      setLocations(previousLocations)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading locations...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarLayout>
      <SubscriptionGate>
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-5 sm:mb-7">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Locations</h1>
              <p className="text-gray-500 mt-0.5 flex items-center gap-2 text-sm sm:text-base">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {locations.length} locations configured
              </p>
            </div>
            <Link
              href="/locations/new"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Location
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {locations.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <MapPin className="w-7 h-7 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2">No locations found</h3>
                <p className="text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">Get started by adding your first storage location to manage your inventory across multiple places.</p>
                <Link
                  href="/locations/new"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Location
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      <th className="px-3 py-3 sm:px-6 sm:py-4">Location</th>
                      <th className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4">Address</th>
                      <th className="px-3 py-3 sm:px-6 sm:py-4">Products</th>
                      <th className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4">Status</th>
                      <th className="px-2 py-3 sm:px-6 sm:py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {locations.map((location) => (
                      <tr
                        key={location.id}
                        onClick={() => router.push(`/locations/${location.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
                      >
                        <td className="px-3 py-3 sm:px-6 sm:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">{location.name}</p>
                              <p className="text-xs text-gray-500">{location.city || 'No address'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4 text-gray-600 text-sm">
                          {location.address || '-'}
                        </td>
                        <td className="px-3 py-3 sm:px-6 sm:py-4">
                          <span className="font-semibold text-gray-900">{location.total_products}</span>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4">
                          {location.is_primary ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200">
                              Primary
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                              Secondary
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3 sm:px-6 sm:py-4">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/locations/${location.id}/edit`)
                              }}
                              className="p-2 sm:p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg sm:rounded-xl transition-all cursor-pointer touch-manipulation"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(location.id)
                              }}
                              className="p-2 sm:p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all cursor-pointer touch-manipulation"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/locations/${location.id}`)
                              }}
                              className="p-2 sm:p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg sm:rounded-xl transition-all cursor-pointer touch-manipulation"
                              title="View Details"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </SubscriptionGate>
    </SidebarLayout>
  )
}
