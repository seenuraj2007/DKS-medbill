'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Package, Edit, Trash2, AlertTriangle, X, SlidersHorizontal } from 'lucide-react'
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
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', {
        credentials: 'include',
        next: { revalidate: 0 }
      })
      if (res.status === 401) {
        router.push('/en/auth?returnTo=/products')
        return
      }
      const data = await res.json()
      if (res.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
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

  const getStatusInfo = (product: Product) => {
    if (product.is_out_of_stock) {
      return { label: 'Out of Stock', color: 'red', bg: 'bg-red-100', text: 'text-red-700' }
    }
    if (product.needs_restock) {
      return { label: 'Low Stock', color: 'amber', bg: 'bg-amber-100', text: 'text-amber-700' }
    }
    return { label: 'In Stock', color: 'green', bg: 'bg-green-100', text: 'text-green-700' }
  }

  const getStockPercentage = (product: Product) => {
    if (product.reorder_point === 0) return product.current_quantity > 0 ? 100 : 0
    return Math.min(100, (product.current_quantity / product.reorder_point) * 100)
  }

  const getStockColor = (product: Product) => {
    if (product.current_quantity === 0) return 'bg-red-500'
    if (product.needs_restock) return 'bg-amber-500'
    return 'bg-green-500'
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
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-500 mt-0.5 text-sm sm:text-base">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </p>
            </div>
            <Link
              href="/products/new"
              prefetch={true}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Product</span>
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-white text-gray-900 placeholder-gray-400"
                />
              </div>
              
              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium active:bg-gray-50"
              >
                <SlidersHorizontal className="w-5 h-5" />
                {categoryFilter ? 'Filtered' : 'Filter'}
              </button>

              {/* Category Filter (Desktop) */}
              <div className="hidden sm:block relative min-w-[180px]">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none bg-white text-gray-700 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none bg-white text-gray-700 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {categoryFilter && (
                  <button
                    onClick={() => setCategoryFilter('')}
                    className="mt-2 text-sm text-indigo-600 font-medium flex items-center gap-1"
                  >
                    <X className="w-4 h-4" /> Clear filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2 font-medium text-lg">
                {searchTerm || categoryFilter ? 'No products found' : 'No products yet'}
              </p>
              <p className="text-gray-400 text-sm mb-6">
                {searchTerm || categoryFilter ? 'Try adjusting your search or filters' : 'Get started by adding your first product'}
              </p>
              {!searchTerm && !categoryFilter && (
                <Link
                  href="/products/new"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg cursor-pointer active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Product
                </Link>
              )}
            </div>
          ) : (
            /* Mobile Card Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => {
                const statusInfo = getStatusInfo(product)
                return (
                  <div
                    key={product.id}
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-4 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    {/* Product Image & Name */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-xl object-cover" />
                        ) : (
                          <Package className="w-7 h-7 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate text-base">{product.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{product.sku || 'No SKU'}</p>
                      </div>
                    </div>

                    {/* Category Badge */}
                    {product.category && (
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium mb-3">
                        {product.category}
                      </span>
                    )}

                    {/* Stock Info */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-500">Stock</span>
                        <span className={`text-sm font-bold ${
                          product.needs_restock ? 'text-amber-600' : 
                          product.is_out_of_stock ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {product.current_quantity} / {product.reorder_point}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${getStockColor(product)}`}
                          style={{ width: `${getStockPercentage(product)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.color !== 'green' && <AlertTriangle className="w-3 h-3" />}
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/products/${product.id}/edit`)
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all font-medium text-sm cursor-pointer active:bg-gray-200"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(product.id, e)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all cursor-pointer active:bg-gray-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </SubscriptionGate>
    </SidebarLayout>
  )
}
