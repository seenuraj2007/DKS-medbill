'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Package, Edit, Trash2, ArrowUpRight, AlertTriangle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionGate } from '@/components/SubscriptionGate'
import SidebarLayout from '@/components/SidebarLayout'

interface Product {
  id: number
  name: string
  sku: string | null
  category: string | null
  current_quantity: number
  reorder_point: number
  supplier_name: string | null
  created_at: string
  needs_restock: boolean
  is_out_of_stock: boolean
  image_url: string | null
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        credentials: 'include',
        next: { revalidate: 60 }
      })
      if (res.status === 401) {
        router.push('/auth?returnTo=/products')
        return
      }
      const data = await res.json()
      if (res.ok) {
        setProducts(data.products || [])
      } else {
        console.error('API Error:', data.error)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    const previousProducts = [...products]
    setProducts(products.filter(p => p.id !== id))

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) {
        setProducts(previousProducts)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      setProducts(previousProducts)
    }
  }

  const filteredProducts = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase()
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(lowerSearch) ||
                           product.sku?.toLowerCase().includes(lowerSearch)
      const matchesCategory = !categoryFilter || product.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, categoryFilter])

  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))
  }, [products])

  const getStatusBadge = (product: Product) => {
    if (product.is_out_of_stock) {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
      </span>
    }
    if (product.needs_restock) {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
        <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
      </span>
    }
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      In Stock
    </span>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarLayout>
      <SubscriptionGate>
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-7">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-500 mt-0.5 flex items-center gap-2 text-sm sm:text-base">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {filteredProducts.length} products in inventory
              </p>
            </div>
            <Link
              href="/products/new"
              prefetch={true}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-white hover:shadow-md cursor-text text-sm sm:text-base text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="w-4 h-4 text-gray-400" />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none bg-white hover:bg-gray-50 cursor-pointer text-sm sm:text-base text-gray-900"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-8 sm:p-16 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-3 sm:mb-4 text-base sm:text-lg font-medium">{searchTerm ? 'No products found' : 'No products yet'}</p>
                <p className="text-gray-400 text-sm mb-5 sm:mb-6">{searchTerm ? 'Try adjusting your search' : 'Get started by adding your first product'}</p>
                {!searchTerm && (
                  <Link
                    href="/products/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Product
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/50 text-left text-xs sm:text-sm font-semibold text-gray-600">
                      <th className="px-3 py-3 sm:px-6 sm:py-4">Product</th>
                      <th className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4">SKU</th>
                      <th className="hidden md:table-cell px-3 py-3 sm:px-6 sm:py-4">Category</th>
                      <th className="px-3 py-3 sm:px-6 sm:py-4">Stock</th>
                      <th className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4">Status</th>
                      <th className="px-2 py-3 sm:px-6 sm:py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-all duration-200 group"
                      >
                        <td className="px-3 py-3 sm:px-6 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover" />
                              ) : (
                                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base truncate">{product.name}</p>
                              <p className="text-xs text-gray-500 truncate">{product.supplier_name || 'No supplier'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4 text-gray-600 text-sm">{product.sku || '-'}</td>
                        <td className="hidden md:table-cell px-3 py-3 sm:px-6 sm:py-4">
                          {product.category ? (
                            <span className="px-2 py-1 sm:px-3 sm:py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm font-medium">
                              {product.category}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-3 sm:px-6 sm:py-4">
                          <div className="text-sm">
                            <span className={`font-bold ${product.current_quantity <= product.reorder_point ? 'text-amber-600' : 'text-gray-900'}`}>
                              {product.current_quantity}
                            </span>
                            <span className="text-gray-400"> / {product.reorder_point}</span>
                          </div>
                          <div className="w-20 sm:w-24 h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                product.current_quantity === 0 ? 'bg-red-500' :
                                product.current_quantity <= product.reorder_point ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, (product.current_quantity / product.reorder_point) * 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3 sm:px-6 sm:py-4">{getStatusBadge(product)}</td>
                        <td className="px-2 py-3 sm:px-6 sm:py-4">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/products/${product.id}/edit`)
                              }}
                              className="p-2 sm:p-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg sm:rounded-xl transition-all cursor-pointer touch-manipulation"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(product.id)
                              }}
                              className="p-2 sm:p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all cursor-pointer touch-manipulation"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/products/${product.id}`)
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
