'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Minus, Trash2, Search, X, DollarSign, 
  Package, Barcode, User, CheckCircle, ShoppingCart, 
  History, Percent, CreditCard, Receipt, Zap,
  ChevronRight, Save, RotateCcw, ArrowLeft
} from 'lucide-react'
import { SubscriptionGate } from '@/components/SubscriptionGate'

interface Product {
  id: number
  name: string
  sku: string | null
  barcode: string | null
  category: string | null
  current_quantity: number
  reorder_point: number
  selling_price: number
  unit_cost: number | null
  unit: string
  image_url: string | null
}

interface CartItem {
  product: Product
  quantity: number
  unitPrice: number
  discount: number
}

interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
}

interface SaleResult {
  success: boolean
  sale?: {
    id: number
    sale_number: string
    total: number
  }
  error?: string
}

interface HeldSale {
  id: string
  cart: CartItem[]
  customer: Customer | null
  timestamp: Date
  total: number
}

export default function BillingPage() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const customerSearchRef = useRef<HTMLInputElement>(null)
  const lastItemRef = useRef<HTMLDivElement>(null)
  
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<SaleResult | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [scannedBarcode, setScannedBarcode] = useState('')
  const [taxRate, setTaxRate] = useState(10)
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [heldSales, setHeldSales] = useState<HeldSale[]>([])
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState(0)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showOrderType, setShowOrderType] = useState(false)
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in')
  const [recentItems, setRecentItems] = useState<CartItem[]>([])
  const [addedItems, setAddedItems] = useState<number[]>([])

  const categories = useMemo(() => 
    Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[])),
    [products]
  )

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/products')
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
        setFilteredCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
    searchInputRef.current?.focus()
  }, [fetchProducts, fetchCustomers])

  useEffect(() => {
    if (showCustomerSelect && customerSearchRef.current) {
      setTimeout(() => customerSearchRef.current?.focus(), 100)
    }
  }, [showCustomerSelect])

  useEffect(() => {
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.includes(customerSearch)
    )
    setFilteredCustomers(filtered)
  }, [customerSearch, customers])

  useEffect(() => {
    if (showScanner && barcodeInputRef.current) {
      barcodeInputRef.current.focus()
    }
  }, [showScanner])

  useEffect(() => {
    if (showScanner && scannedBarcode) {
      const product = products.find(p => p.barcode === scannedBarcode || p.sku === scannedBarcode)
      if (product) {
        addToCart(product)
        setScannedBarcode('')
        setShowScanner(false)
      }
    }
  }, [scannedBarcode, products, showScanner])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          setShowCompleteModal(false)
          setShowCustomerSelect(false)
          setShowHoldModal(false)
          setShowDiscountModal(false)
          setShowOrderType(false)
        }
        return
      }

      if (e.key === 'Escape') {
        setShowScanner(false)
        return
      }

      if (e.key === 'F8') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'F9') {
        e.preventDefault()
        setShowScanner(true)
      }
      if (e.key === 'F1') {
        e.preventDefault()
        clearCart()
      }
      if (e.key === 'F10' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault()
        if (cart.length > 0) setShowCompleteModal(true)
      }
      if (e.key === '+' && !e.ctrlKey && cart.length > 0) {
        e.preventDefault()
        const firstItem = cart[0]
        updateQuantity(firstItem.product.id, firstItem.quantity + 1)
      }
      if (e.key === '-' && !e.ctrlKey && cart.length > 0) {
        e.preventDefault()
        const firstItem = cart[0]
        updateQuantity(firstItem.product.id, firstItem.quantity - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cart.length])

  const addToCart = (product: Product) => {
    if (product.current_quantity <= 0) return

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.current_quantity) return prev
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        product,
        quantity: 1,
        unitPrice: product.selling_price,
        discount: 0
      }]
    })

    setAddedItems(prev => [...prev.slice(-5), product.id])
    setTimeout(() => {
      setAddedItems(prev => prev.filter(id => id !== product.id))
    }, 300)

    setRecentItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ).slice(0, 6)
      }
      return [{ product, quantity: 1, unitPrice: product.selling_price, discount: 0 }, ...prev].slice(0, 6)
    })

    lastItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }

    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const updateDiscount = (productId: number, discount: number) => {
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, discount: Math.max(0, Math.min(discount, item.unitPrice * item.quantity)) }
        : item
    ))
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setGlobalDiscount(0)
    setCashReceived(0)
  }

  const holdSale = () => {
    if (cart.length === 0) return
    
    const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    const globalDiscAmount = (subtotal * globalDiscount) / 100
    const totalDiscount = globalDiscAmount
    const taxableAmount = subtotal - totalDiscount
    const taxAmount = (taxableAmount * taxRate) / 100
    const saleTotal = taxableAmount + taxAmount
    
    const heldSale: HeldSale = {
      id: Date.now().toString(),
      cart: [...cart],
      customer: selectedCustomer,
      timestamp: new Date(),
      total: saleTotal
    }
    setHeldSales(prev => [heldSale, ...prev])
    clearCart()
    setShowHoldModal(false)
  }

  const recallSale = (held: HeldSale) => {
    setCart(held.cart)
    setSelectedCustomer(held.customer)
    setShowHoldModal(false)
  }

  const deleteHeldSale = (id: string) => {
    setHeldSales(prev => prev.filter(h => h.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  const globalDiscAmount = (subtotal * globalDiscount) / 100
  const taxableAmount = subtotal - globalDiscAmount
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount
  const change = Math.max(0, cashReceived - total)

  useEffect(() => {
    if (cart.length > 0 && paymentMethod === 'cash' && cashReceived === 0) {
      setCashReceived(Math.ceil(total))
    }
  }, [cart.length, paymentMethod, total, cashReceived])

  const handleCompleteSale = async () => {
    if (cart.length === 0 || (paymentMethod === 'cash' && cashReceived < total)) return

    setProcessing(true)

    try {
      const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount
      }))

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer?.id,
          items,
          payment_method: paymentMethod,
          payment_status: 'paid',
          notes: `Tax: ${taxRate}%, Discount: ${globalDiscount}%`
        })
      })

      const data = await res.json()

      if (res.ok) {
        setLastSale({ success: true, sale: data.sale })
        setShowReceipt(true)
        clearCart()
        fetchProducts()
      } else {
        setLastSale({ success: false, error: data.error || 'Sale failed'})
      }
    } catch (error) {
      console.error('Error completing sale:', error)
      setLastSale({ success: false, error: 'Network error' })
    } finally {
      setProcessing(false)
      setShowCompleteModal(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm)
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleBarcodeScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const barcode = e.target.value
    if (barcode.length >= 8) {
      const product = products.find(p => p.barcode === barcode || p.sku === barcode)
      if (product) {
        addToCart(product)
        setSearchTerm('')
      }
    }
    setSearchTerm(barcode)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <SubscriptionGate>
      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
                <p className="text-sm text-gray-500">Fast checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Barcode className="w-5 h-5 text-gray-700" />
                <span className="font-medium text-gray-700">Scan</span>
              </button>
              <button
                onClick={() => setShowHoldModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Save className="w-5 h-5 text-gray-700" />
                <span className="font-medium text-gray-700">Hold</span>
                {heldSales.length > 0 && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                    {heldSales.length}
                  </span>
                )}
              </button>
              <button
                onClick={clearCart}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Clear</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products by name, SKU or barcode..."
                    className="w-full pl-11 pr-11 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    !selectedCategory 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Items
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {recentItems.length > 0 && !searchTerm && !selectedCategory && (
              <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span className="text-amber-700 text-sm font-semibold">Quick add:</span>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {recentItems.map(item => (
                    <button
                      key={item.product.id}
                      onClick={() => addToCart(item.product)}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow whitespace-nowrap"
                    >
                      <span className="text-gray-900 font-medium">{item.product.name}</span>
                      <span className="text-gray-400">×{item.quantity}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Package className="w-20 h-20 mb-4" />
                  <p className="text-xl font-medium text-gray-600">No products found</p>
                  <p className="text-sm">Add products to start selling</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {filteredProducts.map(product => {
                    const isAdded = addedItems.includes(product.id)
                    const isLowStock = product.current_quantity <= 5 && product.current_quantity > 0
                    const isOutOfStock = product.current_quantity <= 0
                    
                    return (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        disabled={isOutOfStock}
                        className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                          isOutOfStock 
                            ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed' 
                            : isAdded
                              ? 'bg-green-50 border-green-400 shadow-lg'
                              : 'bg-white border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {isAdded && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className={`aspect-square rounded-xl mb-3 flex items-center justify-center ${
                          isOutOfStock ? 'bg-gray-100' : 'bg-gray-50'
                        }`}>
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <Package className="w-12 h-12 text-gray-300" />
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-indigo-600">
                            ${product.selling_price.toFixed(2)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            isOutOfStock 
                              ? 'bg-red-100 text-red-600' 
                              : isLowStock 
                                ? 'bg-amber-100 text-amber-600' 
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isOutOfStock ? 'Out' : isLowStock ? `Low: ${product.current_quantity}` : product.current_quantity}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="w-96 bg-white shadow-xl flex flex-col border-l border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Current Sale</h2>
                    <p className="text-sm text-gray-500">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOrderType(true)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                    orderType === 'dine-in' ? 'bg-green-100 text-green-700' :
                    orderType === 'takeaway' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}
                >
                  {orderType === 'dine-in' ? '🍽️ Dine In' : orderType === 'takeaway' ? '🥡 Takeaway' : '🚗 Delivery'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6">
                  <ShoppingCart className="w-16 h-16 mb-4 text-gray-200" />
                  <p className="text-lg font-medium text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Tap products to add them</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cart.map((item, index) => (
                    <div 
                      key={item.product.id} 
                      ref={index === cart.length - 1 ? lastItemRef : null}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-3">
                          <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            ${item.unitPrice.toFixed(2)} × {item.quantity}
                            {item.discount > 0 && (
                              <span className="text-green-600 ml-1">(-${item.discount.toFixed(2)})</span>
                            )}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900 text-lg">
                          ${((item.unitPrice * item.quantity) - item.discount).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <input
                          ref={quantityInputRef}
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                          className="w-16 text-center py-2 bg-gray-100 rounded-lg font-semibold"
                          min="1"
                        />
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {globalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Percent className="w-4 h-4" />
                      Discount ({globalDiscount}%)
                    </span>
                    <span className="font-medium">-${globalDiscAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({taxRate}%)</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowCustomerSelect(true)}
                  className="py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  {selectedCustomer ? selectedCustomer.name.split(' ')[0] : 'Customer'}
                </button>
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className={`py-3 border-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                    globalDiscount > 0 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Percent className="w-5 h-5" />
                  {globalDiscount > 0 ? `${globalDiscount}% Off` : 'Discount'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {['cash', 'card', 'transfer'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      paymentMethod === method
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {method === 'cash' && '💵 Cash'}
                    {method === 'card' && '💳 Card'}
                    {method === 'transfer' && '🏦 Transfer'}
                  </button>
                ))}
              </div>

              {paymentMethod === 'cash' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={cashReceived || ''}
                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                        placeholder="Cash received"
                        className="w-full py-3 pl-10 pr-3 bg-white border-2 border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => setCashReceived(Math.ceil(total))}
                      className="px-4 py-3 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Exact
                    </button>
                  </div>
                  {cashReceived > 0 && (
                    <div className="flex justify-between p-4 bg-green-100 rounded-xl border-2 border-green-200">
                      <span className="text-green-700 font-semibold flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Change Due
                      </span>
                      <span className="text-2xl font-bold text-green-700">${change.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              <button
                onClick={() => setShowCompleteModal(true)}
                disabled={cart.length === 0 || processing}
                className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {processing ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Pay ${total.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {showScanner && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Barcode className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Scan Barcode</h3>
                    <p className="text-sm text-gray-500">Point scanner at barcode</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScanner(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <input
                ref={barcodeInputRef}
                type="text"
                value={searchTerm}
                onChange={handleBarcodeScan}
                placeholder="Type or scan barcode..."
                className="w-full px-4 py-4 bg-gray-100 border-0 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-3 text-center">
                Or use a barcode scanner to automatically detect products
              </p>
            </div>
          </div>
        )}

        {showCustomerSelect && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Select Customer</h3>
                <button
                  onClick={() => setShowCustomerSelect(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={customerSearchRef}
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No customers found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setShowCustomerSelect(false)
                        }}
                        className="w-full p-4 text-left rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 hover:border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-bold text-lg">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{customer.name}</p>
                            {(customer.email || customer.phone) && (
                              <p className="text-sm text-gray-500">
                                {customer.email} {customer.phone && `• ${customer.phone}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showCompleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Receipt className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Complete Sale</h3>
                  <p className="text-gray-500">{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="space-y-3 py-4 border-t border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {globalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${globalDiscAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold pt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">${total.toFixed(2)}</span>
                </div>
              </div>
              {paymentMethod === 'cash' && cashReceived > 0 && (
                <div className="flex justify-between p-4 bg-green-50 rounded-xl mt-4">
                  <span className="text-green-700 font-semibold">Cash Received</span>
                  <span className="font-bold text-green-700">${cashReceived.toFixed(2)}</span>
                </div>
              )}
              {paymentMethod === 'cash' && cashReceived > 0 && (
                <div className="flex justify-between p-4 bg-green-100 rounded-xl mt-2">
                  <span className="text-green-800 font-bold">Change</span>
                  <span className="text-2xl font-bold text-green-800">${change.toFixed(2)}</span>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 py-4 bg-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSale}
                  disabled={processing}
                  className="flex-1 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Complete Sale'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showHoldModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Held Sales</h3>
                <button
                  onClick={() => setShowHoldModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {heldSales.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No held sales</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {heldSales.map(held => (
                      <div key={held.id} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex justify-between mb-2">
                          <div>
                            <span className="font-semibold text-gray-900">{held.cart.length} items</span>
                            <p className="text-sm text-gray-500">
                              {new Date(held.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <span className="text-xl font-bold text-indigo-600">${held.total.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => recallSale(held)}
                            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                          >
                            Recall
                          </button>
                          <button
                            onClick={() => deleteHeldSale(held.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showDiscountModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Apply Discount</h3>
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[5, 10, 15, 20, 25, 50].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setGlobalDiscount(pct)}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      globalDiscount === pct
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={globalDiscount}
                onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                placeholder="Custom percentage"
                className="w-full px-4 py-4 bg-gray-100 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setShowDiscountModal(false)}
                className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Apply Discount
              </button>
            </div>
          </div>
        )}

        {showOrderType && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Type</h3>
                <button
                  onClick={() => setShowOrderType(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { type: 'dine-in', icon: '🍽️', label: 'Dine In', desc: 'Customer eats at the restaurant' },
                  { type: 'takeaway', icon: '🥡', label: 'Takeaway', desc: 'Customer picks up the order' },
                  { type: 'delivery', icon: '🚗', label: 'Delivery', desc: 'Order delivered to customer' }
                ].map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => {
                      setOrderType(opt.type as any)
                      setShowOrderType(false)
                    }}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      orderType === opt.type
                        ? 'bg-indigo-50 border-2 border-indigo-300'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{opt.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{opt.label}</p>
                        <p className="text-sm text-gray-500">{opt.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showReceipt && lastSale && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sale Complete!</h3>
                  <p className="text-gray-500">#{lastSale.sale?.sale_number}</p>
                </div>
              </div>
              <div className="py-6 border-t border-b border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                <p className="text-4xl font-bold text-indigo-600">${lastSale.sale?.total.toFixed(2)}</p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Receipt className="w-5 h-5" />
                  Print
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SubscriptionGate>
  )
}
