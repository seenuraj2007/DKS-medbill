'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Minus, Trash2, Search, X, CreditCard, DollarSign, 
  Printer, Receipt, Package, Barcode, User, RotateCcw,
  Calculator, CheckCircle, AlertTriangle, ShoppingCart, 
  History, Key, Zap, Grid, List, Clock, Tag, Percent,
  Wallet, Landmark, RefreshCw
} from 'lucide-react'
import Link from 'next/link'
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

const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500]

export default function BillingPage() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const customerSearchRef = useRef<HTMLInputElement>(null)
  
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
  const [discountPercent, setDiscountPercent] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState(0)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [userRole, setUserRole] = useState<string>('viewer')
  const [heldSales, setHeldSales] = useState<HeldSale[]>([])
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [recentItems, setRecentItems] = useState<CartItem[]>([])
  const [showCalculator, setShowCalculator] = useState(false)
  const [calcValue, setCalcValue] = useState('')

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

  const fetchUserRole = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUserRole(data.user?.role || 'viewer')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
    fetchUserRole()
    searchInputRef.current?.focus()
  }, [fetchProducts, fetchCustomers, fetchUserRole])

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
          if (showCompleteModal) setShowCompleteModal(false)
          else if (showCustomerSelect) setShowCustomerSelect(false)
          else if (showHoldModal) setShowHoldModal(false)
          else if (showDiscountModal) setShowDiscountModal(false)
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
      if (e.key === '+' && !e.ctrlKey) {
        e.preventDefault()
        if (cart.length > 0 && cart[0]) {
          updateQuantity(cart[0].product.id, cart[0].quantity + 1)
        }
      }
      if (e.key === '-' && !e.ctrlKey) {
        e.preventDefault()
        if (cart.length > 0 && cart[0]) {
          updateQuantity(cart[0].product.id, cart[0].quantity - 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cart, showCompleteModal, showCustomerSelect, showHoldModal, showDiscountModal])

  const addToCart = (product: Product) => {
    if (product.current_quantity <= 0) {
      alert('Product is out of stock!')
      return
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.current_quantity) {
          alert('Not enough stock available!')
          return prev
        }
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

    setRecentItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ).slice(0, 10)
      }
      return [{ product, quantity: 1, unitPrice: product.selling_price, discount: 0 }, ...prev].slice(0, 10)
    })
  }

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
      return
    }

    setCart(prev => {
      const item = prev.find(i => i.product.id === productId)
      if (item && newQuantity > item.product.current_quantity) {
        alert('Not enough stock available!')
        return prev
      }
      return prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    })
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
    setDiscountPercent(0)
    setGlobalDiscount(0)
    setCashReceived(0)
  }

  const holdSale = () => {
    if (cart.length === 0) return
    
    const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0)
    const globalDiscAmount = (subtotal * globalDiscount) / 100
    const totalDiscount = itemDiscounts + globalDiscAmount
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
  const itemDiscounts = cart.reduce((sum, item) => sum + item.discount, 0)
  const percentDiscount = (subtotal * discountPercent) / 100
  const globalDiscAmount = (subtotal * globalDiscount) / 100
  const totalDiscount = itemDiscounts + percentDiscount + globalDiscAmount
  const taxableAmount = subtotal - totalDiscount
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount
  const change = Math.max(0, cashReceived - total)

  useEffect(() => {
    if (cart.length > 0 && paymentMethod === 'cash' && cashReceived === 0) {
      setCashReceived(Math.ceil(total / 10) * 10)
    }
  }, [cart.length, paymentMethod, total, cashReceived])

  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('Please add items to the cart!')
      return
    }

    if (paymentMethod === 'cash' && cashReceived < total) {
      alert('Insufficient cash received!')
      return
    }

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
          notes: `Tax: ${taxRate}%, Discount: ${discountPercent}%`
        })
      })

      const data = await res.json()

      if (res.ok) {
        setLastSale({ success: true, sale: data.sale })
        setShowReceipt(true)
        clearCart()
        fetchProducts()
      } else {
        setLastSale({ success: false, error: data.error || 'Sale failed' })
        alert(data.error || 'Sale failed')
      }
    } catch (error) {
      console.error('Error completing sale:', error)
      setLastSale({ success: false, error: 'Network error' })
      alert('Network error. Please try again.')
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

  const printReceipt = () => {
    window.print()
  }

  const safeCalculate = (expression: string): string => {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/.()]/g, '')
      if (!sanitized) return '0'
      const result = Function('"use strict";return (' + sanitized + ')')()
      return typeof result === 'number' ? result.toString() : 'Error'
    } catch {
      return 'Error'
    }
  }

  const handleCalc = (op: string) => {
    try {
      switch (op) {
        case 'C': setCalcValue(''); break
        case '=': setCalcValue(safeCalculate(calcValue)); break
        case '←': setCalcValue(calcValue.slice(0, -1)); break
        default: setCalcValue(calcValue + op);
      }
    } catch (e) {
      setCalcValue('Error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-indigo-300" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <SubscriptionGate>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">StockAlert</span>
              </Link>
              <div className="h-8 w-px bg-gray-200 mx-2"></div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span className="text-lg font-bold text-gray-900">POS</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-600 font-medium">F1 Clear</span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-600 font-medium">F8 Search</span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-gray-600 font-medium">F9 Scan</span>
              <span className="px-2 py-1 bg-gray-100 rounded-lg text-indigo-600 font-semibold">F10 Pay</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="p-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                title="Calculator"
              >
                <Calculator className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowHoldModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
              >
                <History className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Hold ({heldSales.length})</span>
              </button>
              <button
                onClick={() => setShowScanner(!showScanner)}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
              >
                <Barcode className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Scan</span>
              </button>
              <button
                onClick={clearCart}
                className="flex items-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 hover:shadow-md hover:border-red-300 transition-all cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Clear</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showScanner && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-4 shadow-lg">
          <div className="max-w-full mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Barcode className="w-6 h-6" />
                <span className="text-sm font-medium">Scan Barcode:</span>
              </div>
              <input
                ref={barcodeInputRef}
                type="text"
                value={searchTerm}
                onChange={handleBarcodeScan}
                placeholder="Position barcode scanner and press a key..."
                className="flex-1 max-w-xl px-4 py-3 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-white/30 text-base"
                autoFocus
              />
              <button
                onClick={() => setShowScanner(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showCalculator && (
        <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-2xl p-4 z-50 w-72 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-900">Calculator</span>
            <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={calcValue}
            readOnly
            className="w-full p-3 text-right text-lg border border-gray-200 rounded-xl mb-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="grid grid-cols-4 gap-2">
            {['7','8','9','←','4','5','6','*','1','2','3','-','C','0','=','+'].map(btn => (
              <button
                key={btn}
                onClick={() => handleCalc(btn)}
                className={`p-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  btn === 'C' ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                  btn === '=' ? 'bg-green-50 text-green-600 hover:bg-green-100' :
                  btn === '←' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' :
                  'bg-gray-50 text-gray-900 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[280px]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products... (Press F8)"
                  className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-900 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all cursor-text"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowDiscountModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl hover:from-yellow-100 hover:to-amber-100 hover:shadow-md transition-all cursor-pointer"
              >
                <Percent className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-700">Discount</span>
                {globalDiscount > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-xs font-semibold">
                    {globalDiscount}%
                  </span>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4" />
                <span className="font-medium">{filteredProducts.length} products</span>
              </span>
              {recentItems.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{recentItems.length} recent items</span>
                </span>
              )}
            </div>
          </div>

          {recentItems.length > 0 && !searchTerm && !selectedCategory && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">Recently Added:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentItems.map(item => (
                  <button
                    key={item.product.id}
                    onClick={() => addToCart(item.product)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer border border-amber-100"
                  >
                    <span className="text-gray-900 font-medium text-sm">{item.product.name}</span>
                    <span className="text-gray-500 text-sm">×{item.quantity}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-900">No products found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.current_quantity <= 0}
                    className={`p-4 rounded-2xl border transition-all text-left hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                      product.current_quantity <= 0
                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-indigo-300 shadow-lg'
                    }`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm truncate mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-indigo-600">
                        ${product.selling_price.toFixed(2)}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        product.current_quantity <= 0
                          ? 'bg-red-100 text-red-700'
                          : product.current_quantity <= (product.reorder_point || 0)
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {product.current_quantity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.current_quantity <= 0}
                    className={`w-full p-4 rounded-2xl border transition-all text-left hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-4 cursor-pointer ${
                      product.current_quantity <= 0
                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{product.sku || 'No SKU'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xl font-bold text-indigo-600 block">
                        ${product.selling_price.toFixed(2)}
                      </span>
                      <span className={`inline-block mt-1 text-xs px-2.5 py-1 rounded-full font-semibold ${
                        product.current_quantity <= 0
                          ? 'bg-red-100 text-red-700'
                          : product.current_quantity <= (product.reorder_point || 0)
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        Stock: {product.current_quantity}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border-l border-gray-200/50 flex flex-col shadow-xl">
          <div className="p-5 border-b border-gray-100 bg-white/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Current Sale</h2>
                  <p className="text-sm text-gray-500">{cart.length} items</p>
                </div>
              </div>
              {selectedCustomer && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-200">
                  {selectedCustomer.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-center text-gray-900 font-medium">No items in cart</p>
                <p className="text-center text-sm text-gray-500 mt-1">Search and add products to get started</p>
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => searchInputRef.current?.focus()}
                    className="px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Search (F8)
                  </button>
                  <button
                    onClick={() => setShowScanner(true)}
                    className="px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Scan (F9)
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map(item => (
                  <div key={item.product.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">
                          <span className="text-gray-900 font-medium">${item.unitPrice.toFixed(2)}</span> × {item.quantity}
                          {item.discount > 0 && (
                            <span className="text-green-600 ml-2 font-medium">(-${item.discount.toFixed(2)})</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 text-lg">
                          ${((item.unitPrice * item.quantity) - item.discount).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer mt-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        ref={quantityInputRef}
                        type="number"
                        value={item.quantity || ''}
                        placeholder="1"
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                        className="w-20 text-center border border-gray-200 rounded-xl py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        max={item.product.current_quantity}
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.current_quantity}
                        className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className="flex-1"></div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <input
                          type="number"
                          placeholder="Disc"
                          value={item.discount ? item.discount.toFixed(2) : ''}
                          onChange={(e) => updateDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                          className="w-20 text-right text-sm border border-gray-200 rounded-xl py-2 pr-3 pl-6 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 p-5 space-y-4 bg-gradient-to-b from-white to-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            {itemDiscounts > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Item Discounts</span>
                <span className="text-green-600 font-semibold">-${itemDiscounts.toFixed(2)}</span>
              </div>
            )}
            {globalDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Global Discount ({globalDiscount}%)</span>
                <span className="text-green-600 font-semibold">-${globalDiscAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({taxRate}%)</span>
              <span className="text-gray-900 font-semibold">${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCustomerSelect(true)}
                className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-900 font-medium transition-all cursor-pointer bg-white"
              >
                <User className="w-5 h-5" />
                {selectedCustomer ? selectedCustomer.name.slice(0, 12) : 'Customer'}
              </button>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="py-3 border border-gray-200 rounded-xl bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="cash">💵 Cash</option>
                <option value="card">💳 Card</option>
                <option value="transfer">🏦 Transfer</option>
              </select>
            </div>

            {paymentMethod === 'cash' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                      placeholder="Cash received"
                      className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={() => setCashReceived(Math.ceil(total))}
                    className="px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 text-gray-900 font-medium transition-colors cursor-pointer"
                  >
                    Exact
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setCashReceived(amount >= total ? amount : Math.ceil(total / amount) * amount)}
                      className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-900 font-medium transition-all cursor-pointer"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                {cashReceived > 0 && (
                  <div className="flex justify-between text-base p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <span className="text-green-700 font-semibold">Change</span>
                    <span className="font-bold text-green-700">${change.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setShowCompleteModal(true)}
              disabled={cart.length === 0 || processing}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              {processing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>Complete Sale</span>
                  <span className="bg-white/20 px-3 py-1 rounded-lg">${total.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showCustomerSelect && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-900">Select Customer</h3>
              <button onClick={() => setShowCustomerSelect(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={customerSearchRef}
                type="text"
                placeholder="Search customers..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredCustomers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No customers found</p>
              ) : (
                filteredCustomers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      setSelectedCustomer(customer)
                      setShowCustomerSelect(false)
                    }}
                    className="w-full text-left p-4 rounded-xl hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer"
                  >
                    <p className="font-semibold text-gray-900">{customer.name}</p>
                    {(customer.email || customer.phone) && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {customer.email && <span>{customer.email}</span>}
                        {customer.email && customer.phone && <span> • </span>}
                        {customer.phone && <span>{customer.phone}</span>}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Sale</h3>
                <p className="text-sm text-gray-500">Review before completing</p>
              </div>
            </div>
            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-2xl">
              <div className="flex justify-between">
                <span className="text-gray-600">Items</span>
                <span className="font-semibold text-gray-900">{cart.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600 font-semibold">-${totalDiscount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold text-gray-900">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${total.toFixed(2)}</span>
              </div>
              {paymentMethod === 'cash' && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Cash Received</span>
                  <span>${cashReceived.toFixed(2)}</span>
                </div>
              )}
              {paymentMethod === 'cash' && cashReceived > 0 && (
                <div className="flex justify-between text-green-600 font-bold text-lg">
                  <span>Change</span>
                  <span>${change.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 text-gray-900 font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSale}
                disabled={processing}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 cursor-pointer"
              >
                {processing ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Confirm Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHoldModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Held Sales</h3>
              </div>
              <button onClick={() => setShowHoldModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            {heldSales.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No held sales</p>
                <p className="text-sm text-gray-400 mt-1">Hold a sale to save it for later</p>
              </div>
            ) : (
              <div className="space-y-3">
                {heldSales.map(held => (
                  <div key={held.id} className="p-4 border border-gray-200 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {held.customer?.name || 'No Customer'} - <span className="text-indigo-600">${held.total.toFixed(2)}</span>
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {held.timestamp.toLocaleString()} - {held.cart.length} items
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => recallSale(held)}
                          className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          Recall
                        </button>
                        <button
                          onClick={() => deleteHeldSale(held.id)}
                          className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Percent className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Apply Discount</h3>
              </div>
              <button onClick={() => setShowDiscountModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Percentage Discount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 pr-12 text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Discount amount: <span className="text-green-600 font-semibold">-${globalDiscAmount.toFixed(2)}</span></p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15, 20, 25, 50].map(pct => (
                  <button
                    key={pct}
                    onClick={() => setGlobalDiscount(pct)}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      globalDiscount === pct
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200 cursor-pointer"
              >
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceipt && lastSale && lastSale.success && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sale Completed!</h3>
            <p className="text-gray-500 mb-6">Receipt #{lastSale.sale?.sale_number}</p>
            <div className="border-t border-b py-6 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Items</span>
                <span className="font-semibold text-gray-900">{cart.length}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${lastSale.sale?.total?.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReceipt(false)
                  setLastSale(null)
                }}
                className="flex-1 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 text-gray-900 font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          nav, aside, button, .no-print, .fixed {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
    </SubscriptionGate>
  )
}
