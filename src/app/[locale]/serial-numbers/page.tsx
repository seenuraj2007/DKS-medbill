'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, Filter, Package, Tag, Calendar, User, 
  CheckCircle, XCircle, AlertTriangle, Plus, Trash2,
  ChevronLeft, ChevronRight, Loader2, RefreshCw,
  Building, Box, Wrench, ArrowRightLeft, QrCode,
  Download, Printer, History
} from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

interface SerialNumber {
  id: string
  serialNumber: string
  alternateSerial: string | null
  status: 'IN_STOCK' | 'RESERVED' | 'SOLD' | 'DEFECTIVE' | 'RETURNED' | 'IN_TRANSIT' | 'QUARANTINE'
  warrantyExpiry: string | null
  unitCost: number | null
  notes: string | null
  soldAt: string | null
  createdAt: string
  product: {
    id: string
    name: string
    sku: string
    imageUrl: string | null
  }
  batch: {
    id: string
    batchNumber: string
    expiryDate: string | null
  } | null
  stockLevel: {
    id: string
    location: {
      id: string
      name: string
    }
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  IN_STOCK: { bg: 'bg-green-100', text: 'text-green-700', label: 'In Stock' },
  RESERVED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Reserved' },
  SOLD: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Sold' },
  DEFECTIVE: { bg: 'bg-red-100', text: 'text-red-700', label: 'Defective' },
  RETURNED: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Returned' },
  IN_TRANSIT: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Transit' },
  QUARANTINE: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Quarantine' },
}

export default function SerialNumbersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [productId, setProductId] = useState<string>('')
  
  const fetchSerialNumbers = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      params.set('page', pagination.page.toString())
      params.set('limit', pagination.limit.toString())
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (productId) params.set('productId', productId)
      
      const res = await fetch(`/api/serial-numbers?${params}`)
      
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      
      if (!res.ok) throw new Error('Failed to fetch serial numbers')
      
      const data = await res.json()
      setSerialNumbers(data.serialNumbers || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching serial numbers:', error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, statusFilter, productId, router])

  useEffect(() => {
    fetchSerialNumbers()
  }, [fetchSerialNumbers])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this serial number?')) return
    
    try {
      const res = await fetch(`/api/serial-numbers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchSerialNumbers()
      }
    } catch (error) {
      console.error('Error deleting serial number:', error)
    }
  }

  const isWarrantyExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const isWarrantyExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Serial Numbers</h1>
            <p className="text-gray-500 mt-1">Track individual items by serial number</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/serial-numbers/import"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Import</span>
            </Link>
            <Link
              href="/serial-numbers/new"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Serial</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search serial numbers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            >
              <option value="">All Status</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="DEFECTIVE">Defective</option>
              <option value="RETURNED">Returned</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="QUARANTINE">Quarantine</option>
            </select>

            <button
              onClick={fetchSerialNumbers}
              disabled={loading}
              className="p-2.5 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Box className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {serialNumbers.filter(s => s.status === 'IN_STOCK').length}
                </p>
                <p className="text-sm text-gray-500">In Stock</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {serialNumbers.filter(s => s.status === 'SOLD').length}
                </p>
                <p className="text-sm text-gray-500">Sold</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {serialNumbers.filter(s => s.warrantyExpiry && isWarrantyExpired(s.warrantyExpiry)).length}
                </p>
                <p className="text-sm text-gray-500">Expired Warranty</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {serialNumbers.filter(s => s.warrantyExpiry && isWarrantyExpiringSoon(s.warrantyExpiry)).length}
                </p>
                <p className="text-sm text-gray-500">Expiring Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Serial Numbers Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600">Loading serial numbers...</p>
            </div>
          ) : serialNumbers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Tag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">No serial numbers found</p>
              <p className="text-sm mb-6">Start tracking items by adding serial numbers</p>
              <Link
                href="/serial-numbers/new"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add Your First Serial Number
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Serial Number
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Warranty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {serialNumbers.map((serial) => {
                      const statusStyle = STATUS_COLORS[serial.status] || STATUS_COLORS.IN_STOCK
                      
                      return (
                        <tr key={serial.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-mono font-medium text-gray-900">{serial.serialNumber}</p>
                              {serial.alternateSerial && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Alt: {serial.alternateSerial}
                                </p>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {serial.product.imageUrl ? (
                                <img
                                  src={serial.product.imageUrl}
                                  alt={serial.product.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{serial.product.name}</p>
                                <p className="text-xs text-gray-500">{serial.product.sku}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                              {statusStyle.label}
                            </span>
                          </td>
                          
                          <td className="px-4 py-4">
                            {serial.stockLevel ? (
                              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                <Building className="w-4 h-4 text-gray-500" />
                                {serial.stockLevel.location.name}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          
                          <td className="px-4 py-4">
                            {serial.warrantyExpiry ? (
                              <div className="flex items-center gap-1.5">
                                {isWarrantyExpired(serial.warrantyExpiry) ? (
                                  <>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-red-600">
                                      Expired {new Date(serial.warrantyExpiry).toLocaleDateString()}
                                    </span>
                                  </>
                                ) : isWarrantyExpiringSoon(serial.warrantyExpiry) ? (
                                  <>
                                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                                    <span className="text-sm text-orange-600">
                                      Expires {new Date(serial.warrantyExpiry).toLocaleDateString()}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-gray-700">
                                      Until {new Date(serial.warrantyExpiry).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No warranty</span>
                            )}
                          </td>
                          
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">
                              {new Date(serial.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/serial-numbers/${serial.id}`}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <History className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/serial-numbers/${serial.id}/edit`}
                                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Wrench className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(serial.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  )
}
