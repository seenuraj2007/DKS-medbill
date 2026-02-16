'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Minus, Trash2, Search, X, 
  Package, Barcode, User, CheckCircle, ShoppingCart, 
  History, Percent, Receipt, Zap, Clock, CreditCard,
  Wallet, IndianRupee, QrCode, Calculator, RefreshCw,
  ArrowLeft, Save, FolderOpen, Tag, Grid, List,
  ChevronDown, Move, Edit3, Star, AlertCircle,
  Loader2, Info, Scale
} from 'lucide-react'
import QRCode from 'qrcode'
import { memo } from 'react'

// Memoized Product Card Component to prevent unnecessary re-renders
const ProductCard = memo(({
  product,
  viewMode,
  onClick
}: {
  product: Product
  viewMode: 'grid' | 'list'
  onClick: (product: Product) => void
}) => {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    if (product.current_quantity === 0) return
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 300)
    onClick(product)
  }

  return (
    <button
      onClick={handleClick}
      disabled={product.current_quantity === 0}
      className={`product-card relative bg-white rounded-xl border-2 hover:border-indigo-400 hover:shadow-lg active:scale-95 active:bg-indigo-50 transition-all text-left touch-manipulation select-none ${
        viewMode === 'grid'
          ? 'h-full min-h-[140px] p-3 sm:p-4 flex flex-col'
          : 'w-full p-3 sm:p-4 flex items-center gap-3'
      } ${
        product.current_quantity === 0
          ? 'border-gray-200 opacity-50 cursor-not-allowed'
          : product.current_quantity <= product.reorder_point
          ? 'border-orange-300 ring-2 ring-orange-100'
          : 'border-gray-200'
      } ${isClicked ? 'selected' : ''}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {viewMode === 'grid' ? (
        <div className="flex flex-col h-full w-full">
          <div className="w-full aspect-square max-h-28 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
            {product.image_url ? (
<img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="object-cover w-full h-full"
                              loading="lazy"
                            />
            ) : (
              <Package className="w-10 h-10 text-gray-500" />
            )}
          </div>
          <div className="flex-1 flex flex-col min-h-0">
            <p className="font-semibold text-gray-900 text-sm sm:text-base leading-tight line-clamp-2 mb-1">{product.name}</p>
            <p className="text-xs text-gray-500 mb-2">{product.sku || 'No SKU'}</p>
            <div className="flex items-center justify-between mt-auto pt-1 gap-1">
              <p className="font-bold text-indigo-600 text-base sm:text-lg">₹{product.selling_price.toFixed(0)}</p>
              <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${product.current_quantity === 0 ? 'bg-red-100 text-red-700' : product.current_quantity <= product.reorder_point ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                {product.current_quantity}
              </span>
            </div>
          </div>
          {product.current_quantity === 0 && (
            <div className="absolute inset-0 bg-gray-100/80 rounded-xl flex items-center justify-center">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">OUT OF STOCK</span>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 relative">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="object-cover w-full h-full rounded-xl"
                loading="lazy"
              />
            ) : (
              <Package className="w-8 h-8 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">{product.name}</p>
            <p className="text-sm text-gray-500">{product.sku || 'No SKU'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.current_quantity === 0 ? 'bg-red-100 text-red-700' : product.current_quantity <= product.reorder_point ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                Stock: {product.current_quantity}
              </span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <p className="font-bold text-indigo-600 text-lg sm:text-xl">₹{product.selling_price.toFixed(0)}</p>
            {product.current_quantity > 0 && (
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-indigo-600" />
              </div>
            )}
          </div>
        </>
      )}
    </button>
  )
})

ProductCard.displayName = 'ProductCard'

// Types
interface Product {
  id: string
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
  hsn_code?: string | null
  gst_rate?: number
  is_favorite?: boolean
  is_perishable?: boolean
  expiry_date?: string | null
  weight_per_unit?: number
  min_weight?: number | null
}

interface CartItem {
  product: Product
  quantity: number
  unitPrice: number
  discount: number
  taxableAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalAmount: number
  serialNumbers?: string[] // Selected serial numbers for this item
  weightKg?: number // For weight-based products
}

interface SerialNumberInfo {
  id: string
  serialNumber: string
  status: string
  warrantyExpiry: string | null
}

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  pincode?: string | null
  gstNumber?: string | null
}

interface SaleResult {
  success: boolean
  invoice?: {
    id: string
    invoiceNumber: string
    totalAmount: number
    invoiceDate: string
    qrCode?: string
  }
  error?: string
}

interface HeldSale {
  id: string
  cart: CartItem[]
  customer: Customer | null
  timestamp: Date
  total: number
  note?: string
}

interface PaymentSplit {
  method: 'cash' | 'card' | 'upi' | 'credit'
  amount: number
  reference?: string
}

interface OrganizationSettings {
  name?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  gstNumber?: string
  phone?: string
  email?: string
}

// Constants
const GST_RATES = [0, 5, 12, 18, 28]
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: '💵', color: 'bg-green-500' },
  { id: 'upi', label: 'UPI', icon: '📱', color: 'bg-purple-500' },
  { id: 'credit', label: 'Credit', icon: '📋', color: 'bg-orange-500' },
]

export default function POSPage() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerSelect, setShowCustomerSelect] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<SaleResult | null>(null)
  const [receiptData, setReceiptData] = useState<{
    cart: CartItem[]
    customer: Customer | null
    subtotal: number
    totalDiscount: number
    totalGST: number
    paymentMethod: string
    cashReceived: number
    change: number
  } | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const [scannedBarcode, setScannedBarcode] = useState('')
  const [globalDiscount, setGlobalDiscount] = useState(0)
  const [globalDiscountType, setGlobalDiscountType] = useState<'percent' | 'amount'>('percent')
  const [heldSales, setHeldSales] = useState<HeldSale[]>([])
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [holdNote, setHoldNote] = useState('')
  const [showSplitPayment, setShowSplitPayment] = useState(false)
  const [splitPayments, setSplitPayments] = useState<PaymentSplit[]>([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashReceived, setCashReceived] = useState(0)
  const [showMobileCart, setShowMobileCart] = useState(false)
  const [clickedProduct, setClickedProduct] = useState<string | null>(null)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [organization, setOrganization] = useState<OrganizationSettings & { upiId?: string }>({})
  const [isInterState, setIsInterState] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
  const [showUpiQrModal, setShowUpiQrModal] = useState(false)
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('')
  const [upiPaymentStatus, setUpiPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending')
  const [error, setError] = useState<string | null>(null)
  const [customersLoading, setCustomersLoading] = useState(false)
  const [orgLoading, setOrgLoading] = useState(false)
  
  // Serial number state
  const [showSerialModal, setShowSerialModal] = useState(false)
  const [selectedProductForSerial, setSelectedProductForSerial] = useState<Product | null>(null)
  
  // Weight input state for produce
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [selectedProductForWeight, setSelectedProductForWeight] = useState<Product | null>(null)
  const [enteredWeight, setEnteredWeight] = useState('')
  const [availableSerials, setAvailableSerials] = useState<SerialNumberInfo[]>([])
  const [selectedSerials, setSelectedSerials] = useState<string[]>([])
  const [loadingSerials, setLoadingSerials] = useState(false)
  
  // Derived state
  const categories = useMemo(() => 
    Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[])),
    [products]
  )

  const filteredProducts = useMemo(() => {
    let filtered = products
    
    if (showFavoritesOnly) {
      filtered = filtered.filter(p => p.is_favorite)
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.barcode?.includes(term) ||
        p.hsn_code?.includes(term)
      )
    }
    
    return filtered
  }, [products, searchTerm, selectedCategory, showFavoritesOnly])

  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.taxableAmount, 0),
    [cart]
  )

  const totalDiscount = useMemo(() => {
    if (globalDiscountType === 'percent') {
      return subtotal * (globalDiscount / 100)
    }
    return Math.min(globalDiscount, subtotal)
  }, [subtotal, globalDiscount, globalDiscountType])

  const totalGST = useMemo(() => 
    cart.reduce((sum, item) => sum + item.cgstAmount + item.sgstAmount + item.igstAmount, 0),
    [cart]
  )

  const total = useMemo(() => subtotal - totalDiscount + totalGST, [subtotal, totalDiscount, totalGST])

  const change = useMemo(() => Math.max(0, cashReceived - total), [cashReceived, total])

  const splitTotal = useMemo(() => 
    splitPayments.reduce((sum, p) => sum + p.amount, 0),
    [splitPayments]
  )

  // API calls with error handling
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/billing/products', {
        credentials: 'include'
      })
      
      // Check if response is HTML (redirect to login)
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        router.push('/auth')
        return
      }
      
      if (res.status === 401) {
        router.push('/auth')
        return
      }
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`)
      }
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchCustomers = useCallback(async () => {
    try {
      setCustomersLoading(true)
      const res = await fetch('/api/customers', { credentials: 'include' })
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setCustomers([])
        return
      }
      if (res.ok) {
        const data = await res.json()
        setCustomers(data.customers || [])
      } else if (res.status === 404) {
        setCustomers([])
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    } finally {
      setCustomersLoading(false)
    }
  }, [])

  const fetchOrganization = useCallback(async () => {
    try {
      setOrgLoading(true)
      const res = await fetch('/api/settings/organization', { credentials: 'include' })
      const contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        setOrganization({})
        return
      }
      if (res.ok) {
        const data = await res.json()
        setOrganization(data.organization || {})
      } else if (res.status === 404) {
        setOrganization({})
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
      setOrganization({})
    } finally {
      setOrgLoading(false)
    }
  }, [])

  // Effects
  useEffect(() => {
    fetchProducts()
    fetchCustomers()
    fetchOrganization()
    searchInputRef.current?.focus()
  }, [fetchProducts, fetchCustomers, fetchOrganization])

  useEffect(() => {
    if (selectedCustomer?.state && organization.state) {
      setIsInterState(selectedCustomer.state.toLowerCase() !== organization.state.toLowerCase())
    } else {
      setIsInterState(false)
    }
  }, [selectedCustomer, organization])

  useEffect(() => {
    if (cart.length > 0 && paymentMethod === 'cash' && cashReceived === 0) {
      setCashReceived(Math.ceil(total))
    }
  }, [cart.length, paymentMethod, total, cashReceived])

  // Calculations
  const calculateItemPrice = (product: Product, qty: number = 1, discount: number = 0) => {
    const taxableAmount = product.selling_price * qty * (1 - discount / 100)
    const gstRate = product.gst_rate || 0
    const gstAmount = taxableAmount * (gstRate / 100)
    
    if (isInterState) {
      return {
        taxableAmount,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: gstAmount,
        totalAmount: taxableAmount + gstAmount
      }
    }
    
    return {
      taxableAmount,
      cgstAmount: gstAmount / 2,
      sgstAmount: gstAmount / 2,
      igstAmount: 0,
      totalAmount: taxableAmount + gstAmount
    }
  }

  // Serial number functions
  const fetchAvailableSerials = async (productId: string) => {
    try {
      setLoadingSerials(true)
      const res = await fetch(`/api/serial-numbers?productId=${productId}&status=IN_STOCK`)
      if (res.ok) {
        const data = await res.json()
        setAvailableSerials(data.serialNumbers || [])
      }
    } catch (error) {
      console.error('Error fetching serial numbers:', error)
    } finally {
      setLoadingSerials(false)
    }
  }

  const openSerialModal = async (product: Product) => {
    setSelectedProductForSerial(product)
    setSelectedSerials([])
    await fetchAvailableSerials(product.id)
    setShowSerialModal(true)
  }

  const closeSerialModal = () => {
    setShowSerialModal(false)
    setSelectedProductForSerial(null)
    setAvailableSerials([])
    setSelectedSerials([])
  }

  const toggleSerialSelection = (serialNumber: string) => {
    setSelectedSerials(prev => 
      prev.includes(serialNumber)
        ? prev.filter(s => s !== serialNumber)
        : [...prev, serialNumber]
    )
  }

  const confirmSerialSelection = () => {
    if (!selectedProductForSerial || selectedSerials.length === 0) {
      closeSerialModal()
      return
    }

    const existingItem = cart.find(item => item.product.id === selectedProductForSerial.id)
    
    if (existingItem) {
      const updatedCart = cart.map(item => 
        item.product.id === selectedProductForSerial.id 
          ? { 
              ...item, 
              quantity: item.quantity + selectedSerials.length,
              serialNumbers: [...(item.serialNumbers || []), ...selectedSerials],
              ...calculateItemPrice(item.product, item.quantity + selectedSerials.length, item.discount)
            }
          : item
      )
      setCart(updatedCart)
    } else {
      const newItem: CartItem = {
        product: selectedProductForSerial,
        quantity: selectedSerials.length,
        unitPrice: selectedProductForSerial.selling_price,
        discount: 0,
        serialNumbers: selectedSerials,
        ...calculateItemPrice(selectedProductForSerial, selectedSerials.length)
      }
      setCart([...cart, newItem])
    }
    
    closeSerialModal()
  }

  // Cart actions
  const addToCart = async (product: Product) => {
    // Trigger glow effect
    setClickedProduct(product.id)
    setTimeout(() => setClickedProduct(null), 400) // Clear after animation
    
    // Add to cart immediately for better UX
    const existingItem = cart.find(item => item.product.id === product.id)
    
    // Check if this is a weight-based product
    const isWeightBased = product.weight_per_unit && product.weight_per_unit > 0
    
    if (isWeightBased) {
      // Show weight input modal for produce/weight-based items
      setSelectedProductForWeight(product)
      setEnteredWeight('')
      setShowWeightModal(true)
      return
    }

    if (existingItem) {
      const updatedCart = cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1, ...calculateItemPrice(item.product, item.quantity + 1, item.discount) }
          : item
      )
      setCart(updatedCart)
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        unitPrice: product.selling_price,
        discount: 0,
        ...calculateItemPrice(product)
      }
      setCart([...cart, newItem])
    }
    
    // Check if product has serial numbers (async, non-blocking)
    try {
      const res = await fetch(`/api/serial-numbers?productId=${product.id}&status=IN_STOCK`)
      if (res.ok) {
        const data = await res.json()
        if (data.serialNumbers && data.serialNumbers.length > 0) {
          // Product has serial numbers, open modal to select
          openSerialModal(product)
        }
      }
    } catch (error) {
      // Silent fail - product already added to cart
      console.error('Error checking serial numbers:', error)
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    const updatedCart = cart.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta)
        if (newQty === 0) return null
        return { ...item, quantity: newQty, ...calculateItemPrice(item.product, newQty, item.discount) }
      }
      return item
    }).filter(Boolean) as CartItem[]
    setCart(updatedCart)
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const clearCart = () => {
    if (cart.length > 0 && !confirm('Are you sure you want to clear the cart?')) return
    setCart([])
    setGlobalDiscount(0)
    setSelectedCustomer(null)
    setItemNotes({})
  }

  const holdSale = () => {
    if (cart.length === 0) return
    
    const held: HeldSale = {
      id: Date.now().toString(),
      cart: [...cart],
      customer: selectedCustomer,
      timestamp: new Date(),
      total,
      note: holdNote
    }
    
    setHeldSales([held, ...heldSales])
    clearCart()
    setShowHoldModal(false)
    setHoldNote('')
  }

  const recallSale = (held: HeldSale) => {
    setCart(held.cart)
    setSelectedCustomer(held.customer)
    setHeldSales(heldSales.filter(h => h.id !== held.id))
  }

  const deleteHeldSale = (id: string) => {
    setHeldSales(heldSales.filter(h => h.id !== id))
  }

  // Barcode handling
  const handleBarcodeScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const barcode = e.target.value
    if (barcode.length >= 8) {
      const product = products.find(p => p.barcode === barcode || p.sku === barcode)
      if (product) {
        addToCart(product)
        setScannedBarcode('')
      }
    }
    setSearchTerm(barcode)
  }

  // Payment handling
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      setError('Cart is empty. Please add products first.')
      return
    }
    if (paymentMethod === 'cash' && cashReceived < total) {
      setError('Insufficient cash received.')
      return
    }
    
    setProcessing(true)
    setError(null)
    
    try {
      const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
        taxable_amount: item.taxableAmount,
        cgst_amount: item.cgstAmount,
        sgst_amount: item.sgstAmount,
        igst_amount: item.igstAmount,
        total_amount: item.totalAmount,
        hsn_code: item.product.hsn_code,
        gst_rate: item.product.gst_rate,
        serial_numbers: item.serialNumbers || undefined
      }))

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer?.id,
          items,
          payment_method: paymentMethod,
          global_discount: globalDiscount,
          global_discount_type: globalDiscountType,
          notes: Object.keys(itemNotes).length > 0 ? JSON.stringify(itemNotes) : null
        })
      })

      const data = await res.json()
      
      if (data.invoice) {
        // Store receipt data before clearing cart
        setReceiptData({
          cart: [...cart],
          customer: selectedCustomer,
          subtotal,
          totalDiscount,
          totalGST,
          paymentMethod,
          cashReceived,
          change
        })
        setLastSale({ success: true, invoice: data.invoice })
        setShowReceipt(true)
        clearCart()
        // Refresh products to show updated stock levels
        fetchProducts()
      } else {
        setError(data.error || 'Sale failed. Please try again.')
      }
    } catch (error) {
      console.error('Sale error:', error)
      setError('Failed to complete sale. Please check your connection and try again.')
    } finally {
      setProcessing(false)
      setShowCompleteModal(false)
    }
  }

  // UPI QR Payment
  const generateUpiQr = async () => {
    if (!organization.upiId) return
    
    const upiUrl = `upi://pay?pa=${organization.upiId}&pn=${encodeURIComponent(organization.name || 'Merchant')}&am=${total.toFixed(2)}&cu=INR&tn=Payment for Invoice`
    
    try {
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 250,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setUpiQrDataUrl(qrDataUrl)
    } catch (err) {
      console.error('Error generating QR:', err)
    }
  }

  const handleUpiPayment = async () => {
    setShowCompleteModal(false)
    setUpiPaymentStatus('pending')
    setShowUpiQrModal(true)
    await generateUpiQr()
  }

  const confirmUpiPayment = async () => {
    setUpiPaymentStatus('processing')
    setProcessing(true)
    
    try {
      const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount: item.discount,
        taxable_amount: item.taxableAmount,
        cgst_amount: item.cgstAmount,
        sgst_amount: item.sgstAmount,
        igst_amount: item.igstAmount,
        total_amount: item.totalAmount,
        hsn_code: item.product.hsn_code,
        gst_rate: item.product.gst_rate
      }))

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer?.id,
          items,
          payment_method: 'upi',
          global_discount: globalDiscount,
          global_discount_type: globalDiscountType,
          notes: Object.keys(itemNotes).length > 0 ? JSON.stringify(itemNotes) : null
        })
      })

      const data = await res.json()
      
      if (data.invoice) {
        setUpiPaymentStatus('success')
        setLastSale({ success: true, invoice: data.invoice })
        setTimeout(() => {
          setShowUpiQrModal(false)
          setShowReceipt(true)
          clearCart()
          // Refresh products to show updated stock levels
          fetchProducts()
        }, 1500)
      } else {
        setUpiPaymentStatus('failed')
        setError(data.error || 'Payment failed')
      }
    } catch (error) {
      console.error('UPI payment error:', error)
      setUpiPaymentStatus('failed')
      setError('Failed to complete payment')
    } finally {
      setProcessing(false)
    }
  }

  // Quick amount buttons for cash
  const quickCashAmounts = [100, 200, 500, 1000, 2000]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 max-w-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
            <p className="text-xs text-gray-500">Billing & Invoice System</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            {cart.length} items
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Hold/Recall */}
          <button
            onClick={() => setShowHoldModal(true)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Hold Sale"
          >
            <FolderOpen className="w-5 h-5 text-gray-600" />
            <span className="hidden sm:inline text-sm text-gray-700">Hold</span>
            {heldSales.length > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {heldSales.length}
              </span>
            )}
          </button>
          
          {/* Clear Cart */}
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear Cart"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
              <span className="hidden sm:inline text-sm text-red-600">Clear</span>
            </button>
          )}
          
          {/* Mobile Cart Button */}
          <button
            onClick={() => setShowMobileCart(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{cart.length}</span>
          </button>
        </div>
      </header>

      {/* Mobile Sticky Bottom Bar - Shows when cart has items */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg shadow-gray-200/50 z-40 px-4 py-3 pb-safe">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setShowMobileCart(true)}
              className="flex items-center gap-3 flex-1"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
                <p className="text-sm text-indigo-600 font-bold">₹{total.toFixed(0)}</p>
              </div>
            </button>
            <button
              onClick={() => setShowMobileCart(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 active:scale-95 transition-transform flex items-center gap-2"
            >
              <span>Pay</span>
              <IndianRupee className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden">
        {/* Products Section */}
        <div className={`flex-1 flex flex-col overflow-auto lg:overflow-hidden pb-24 lg:pb-0 ${showMobileCart ? 'hidden lg:flex' : 'flex'}`}>
          {/* Search & Filters */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products by name, SKU, barcode..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>
              
              <button
                onClick={() => setShowScanner(!showScanner)}
                className={`p-2.5 rounded-xl transition-colors ${showScanner ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Barcode Scanner"
              >
                <Barcode className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2.5 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
                title="Toggle View"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>

              <button
                onClick={fetchProducts}
                disabled={loading}
                className="p-2.5 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Refresh Products"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => { setSelectedCategory(null); setShowFavoritesOnly(false); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory && !showFavoritesOnly 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setSelectedCategory(null); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  showFavoritesOnly
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className="w-3.5 h-3.5" /> Favorites
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setShowFavoritesOnly(false); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Barcode Scanner Input */}
          {showScanner && (
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={scannedBarcode}
                  onChange={(e) => {
                    setScannedBarcode(e.target.value)
                    if (e.target.value.length >= 8) {
                      const product = products.find(p => p.barcode === e.target.value || p.sku === e.target.value)
                      if (product) {
                        addToCart(product)
                        setScannedBarcode('')
                        setShowScanner(false)
                      }
                    }
                  }}
                  placeholder="Scan or type barcode..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading products...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <AlertCircle className="w-12 h-12 mb-3 text-red-500" />
                <p className="text-lg font-medium text-gray-900 mb-2">Failed to load products</p>
                <p className="text-sm mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Package className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No products found' : 'No products available'}
                </p>
                <p className="text-sm mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add products to your inventory to start billing'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                : "space-y-2"
              }>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    onClick={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className={`w-full lg:w-[420px] bg-white border-l border-gray-200 flex flex-col overflow-auto lg:overflow-hidden ${showMobileCart ? 'fixed inset-0 z-[60]' : 'hidden lg:flex'}`}>
          {/* Mobile Cart Header */}
          <div className="lg:hidden flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Cart ({cart.length} items)</h2>
            <button
              onClick={() => setShowMobileCart(false)}
              className="p-3 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <X className="w-7 h-7 text-gray-600" />
            </button>
          </div>
          
          {/* Customer Selection */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowCustomerSelect(true)}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">
                  {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
                </p>
                {selectedCustomer?.phone && (
                  <p className="text-sm text-gray-500">{selectedCustomer.phone}</p>
                )}
                {!selectedCustomer && (
                  <p className="text-xs text-gray-500">Tap to select customer</p>
                )}
              </div>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 pb-32">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                <ShoppingCart className="w-16 h-16 mb-3 opacity-30" />
                <p className="text-gray-900 font-medium text-lg">Cart is empty</p>
                <p className="text-sm text-gray-500">Tap products to add them</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                    {/* Compact single row design */}
                    <div className="flex items-center gap-3">
                      {/* Product Image - smaller */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.product.image_url ? (
                          <img 
                            src={item.product.image_url} 
                            alt={item.product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item.weightKg 
                            ? `${item.weightKg.toFixed(2)} kg @ ₹${item.unitPrice.toFixed(0)}/kg`
                            : `₹${item.unitPrice.toFixed(0)} × ${item.quantity}`
                          }
                        </p>
                      </div>
                      
                      {/* Quantity Controls - very compact */}
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          disabled={!!item.weightKg || item.quantity <= 1}
                          className="w-7 h-7 bg-white rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          disabled={!!item.weightKg}
                          className="w-7 h-7 bg-white rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Price & Delete */}
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm">₹{item.totalAmount.toFixed(0)}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* Weight Input Modal for Produce/Weight-based Items */}
        {showWeightModal && selectedProductForWeight && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Enter Weight</h2>
                  <p className="text-sm text-gray-500">{selectedProductForWeight.name}</p>
                </div>
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="number"
                      value={enteredWeight}
                      onChange={(e) => setEnteredWeight(e.target.value)}
                      placeholder="0.5"
                      step="0.01"
                      min={selectedProductForWeight.min_weight || 0.01}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 text-lg"
                      autoFocus
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Price: ₹{selectedProductForWeight.selling_price}/kg • 
                    Min: {selectedProductForWeight.min_weight || 0.1}kg
                  </p>
                </div>

                {enteredWeight && parseFloat(enteredWeight) > 0 && (
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total:</span>
                      <span className="text-xl font-bold text-indigo-600">
                        ₹{(parseFloat(enteredWeight) * selectedProductForWeight.selling_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const weight = parseFloat(enteredWeight)
                    if (weight > 0) {
                      // Add weight-based item to cart
                      const pricePerKg = selectedProductForWeight.selling_price
                      const totalPrice = weight * pricePerKg
                      
                      const newItem: CartItem = {
                        product: selectedProductForWeight,
                        quantity: 1,
                        unitPrice: pricePerKg,
                        discount: 0,
                        weightKg: weight,
                        taxableAmount: totalPrice,
                        cgstAmount: 0,
                        sgstAmount: 0,
                        igstAmount: 0,
                        totalAmount: totalPrice
                      }
                      setCart([...cart, newItem])
                      setShowWeightModal(false)
                      setEnteredWeight('')
                    }
                  }}
                  disabled={!enteredWeight || parseFloat(enteredWeight) <= 0}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Totals */}
          <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            
            {totalDiscount > 0 && (
              <div className="flex justify-between text-base text-green-600">
                <span>Discount ({globalDiscountType === 'percent' ? `${globalDiscount}%` : `₹${globalDiscount}`})</span>
                <span className="font-medium">-₹{totalDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-base">
              <span className="text-gray-600">GST</span>
              <span className="font-medium text-gray-900">₹{totalGST.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-indigo-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setGlobalDiscountType(globalDiscountType === 'percent' ? 'amount' : 'percent')}
                className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {globalDiscountType === 'percent' ? '% Discount' : '₹ Discount'}
              </button>
              <input
                type="number"
                value={globalDiscount || ''}
                onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                placeholder={globalDiscountType === 'percent' ? '%' : '₹'}
                className="w-20 px-3 py-2 bg-gray-100 rounded-lg text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
              />
            </div>
            
            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-4 sm:py-2 rounded-xl text-base font-medium transition-all touch-manipulation ${
                    paymentMethod === method.id
                      ? `${method.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="block text-2xl mb-1">{method.icon}</span>
                  <span className="hidden sm:inline">{method.label}</span>
                  <span className="sm:hidden">{method.label}</span>
                </button>
              ))}
            </div>
            
            {/* Cash Input */}
            {paymentMethod === 'cash' && (
              <div className="mb-3">
                <div className="flex gap-1 mb-2">
                  {quickCashAmounts.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setCashReceived(amount)}
                      className={`flex-1 py-2 sm:py-1.5 text-sm sm:text-xs font-medium rounded-lg transition-colors touch-manipulation ${
                        cashReceived === amount
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="number"
                    value={cashReceived || ''}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    placeholder="Cash received"
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
                {cashReceived > 0 && cashReceived >= total && (
                  <div className="flex justify-between mt-2 p-2 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700">Change Due</span>
                    <span className="font-bold text-green-700">₹{change.toFixed(2)}</span>
                  </div>
                )}
                {cashReceived > 0 && cashReceived < total && (
                  <div className="flex justify-between mt-2 p-2 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-700">Balance Due</span>
                    <span className="font-bold text-red-700">₹{(total - cashReceived).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Complete Sale Button */}
            <button
              onClick={() => setShowCompleteModal(true)}
              disabled={cart.length === 0 || processing || (paymentMethod === 'cash' && cashReceived < total)}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg touch-manipulation"
            >
              {processing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span className="hidden sm:inline">Complete Sale</span>
                  <span className="sm:hidden text-xl">Pay ₹{total.toFixed(0)}</span>
                  <span className="hidden sm:inline">₹{total.toFixed(0)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Selection Modal */}
      {showCustomerSelect && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Select Customer</h2>
              <button onClick={() => setShowCustomerSelect(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              {customersLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                  <p className="text-gray-600">Loading customers...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No customers found</p>
                  <button
                    onClick={() => setShowCustomerSelect(false)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Use Walk-in Customer
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="w-full px-4 py-2 bg-gray-100 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                    onChange={(e) => {
                      const term = e.target.value.toLowerCase()
                      const filtered = customers.filter(c => 
                        c.name.toLowerCase().includes(term) || 
                        c.phone?.includes(term)
                      )
                      setCustomers(filtered.length > 0 ? filtered : customers)
                    }}
                  />
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedCustomer(null); setShowCustomerSelect(false); }}
                      className="w-full p-3 text-left hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <p className="font-medium text-gray-900">Walk-in Customer</p>
                      <p className="text-sm text-gray-500">No customer selected</p>
                    </button>
                    {customers.map(customer => (
                      <button
                        key={customer.id}
                        onClick={() => { setSelectedCustomer(customer); setShowCustomerSelect(false); }}
                        className="w-full p-3 text-left hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.phone || customer.email}</p>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hold Sale Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {cart.length > 0 ? 'Hold Sale' : 'Held Sales'}
              </h2>
              <button onClick={() => setShowHoldModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              {cart.length > 0 && (
                <>
                  <input
                    type="text"
                    value={holdNote}
                    onChange={(e) => setHoldNote(e.target.value)}
                    placeholder="Add a note (optional)"
                    className="w-full px-4 py-2 bg-gray-100 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500"
                  />
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={holdSale}
                      className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Hold Sale
                    </button>
                    <button
                      onClick={() => setShowHoldModal(false)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
              
              {heldSales.length > 0 && (
                <div className={cart.length > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}>
                  <h3 className="font-medium text-gray-900 mb-2">Held Sales ({heldSales.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {heldSales.map(held => (
                      <div key={held.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">₹{held.total.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{held.cart.length} items • {new Date(held.timestamp).toLocaleTimeString()}</p>
                          {held.note && <p className="text-xs text-gray-500 truncate">{held.note}</p>}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => { recallSale(held); setShowHoldModal(false); }}
                            className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                            title="Recall Sale"
                          >
                            <Move className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteHeldSale(held.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complete Sale Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Confirm Sale</h2>
              <button onClick={() => setShowCompleteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-indigo-600">₹{total.toFixed(2)}</p>
                <p className="text-gray-500">{cart.length} items • {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</p>
              </div>
              
              {paymentMethod === 'cash' && cashReceived > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Cash Received:</span>
                    <span className="font-medium text-gray-900">₹{cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Change:</span>
                    <span className="font-bold text-green-600">₹{change.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && !organization.upiId && (
                <div className="bg-red-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-700">Please configure UPI ID in Organization Settings to accept UPI payments.</p>
                </div>
              )}

              {paymentMethod === 'upi' && organization.upiId && (
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-purple-700">Customer will scan QR code to pay ₹{total.toFixed(2)}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={paymentMethod === 'upi' && organization.upiId ? handleUpiPayment : handleCompleteSale}
                  disabled={processing || (paymentMethod === 'upi' && !organization.upiId)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : paymentMethod === 'upi' && organization.upiId ? (
                    'Generate Payment QR'
                  ) : (
                    'Confirm Payment'
                  )}
                </button>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  disabled={processing}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <>
          {/* Screen View */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Sale Complete!</h2>
                <p className="text-gray-500 text-sm mb-4">Invoice #{lastSale.invoice?.invoiceNumber}</p>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-3xl font-bold text-indigo-600">₹{lastSale.invoice?.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</p>
                </div>

                {/* QR Code Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Scan to save receipt</p>
                  <div className="bg-white p-2 inline-block">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://stockalert-seven.vercel.app/en/receipt/${lastSale.invoice?.id}`)}`}
                      alt="Receipt QR Code"
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Valid for 1 year</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowReceipt(false)
                      setReceiptData(null)
                      setCashReceived(0)
                    }}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    New Sale
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-4 h-4" /> Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Printable Receipt - Hidden on screen, shown on print */}
          <div className="hidden print:block print:fixed print:inset-0 print:z-50 print:bg-white print:p-0">
            <div className="print-receipt max-w-[80mm] mx-auto bg-white text-gray-900 font-mono text-xs leading-tight">
              {/* Organization Header */}
              <div className="text-center border-b-2 border-gray-900 pb-3 mb-3">
                <h1 className="text-lg font-bold uppercase tracking-wide">
                  {organization.name || 'DKS StockAlert'}
                </h1>
                {organization.address && (
                  <p className="text-xs mt-1">{organization.address}</p>
                )}
                {(organization.city || organization.state) && (
                  <p className="text-xs">
                    {organization.city}{organization.city && organization.state && ', '}{organization.state} {organization.pincode}
                  </p>
                )}
                {organization.gstNumber && (
                  <p className="text-xs mt-1 font-semibold">GSTIN: {organization.gstNumber}</p>
                )}
                {organization.phone && (
                  <p className="text-xs">Phone: {organization.phone}</p>
                )}
              </div>

              {/* Invoice Details */}
              <div className="border-b border-gray-400 pb-2 mb-2">
                <div className="flex justify-between">
                  <span>Invoice #:</span>
                  <span className="font-semibold">{lastSale.invoice?.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{lastSale.invoice?.invoiceDate ? new Date(lastSale.invoice.invoiceDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Customer Details */}
              {receiptData?.customer && (
                <div className="border-b border-gray-400 pb-2 mb-2">
                  <p className="font-semibold">Customer:</p>
                  <p>{receiptData.customer.name}</p>
                  {receiptData.customer.phone && <p>Phone: {receiptData.customer.phone}</p>}
                  {receiptData.customer.gstNumber && <p>GSTIN: {receiptData.customer.gstNumber}</p>}
                </div>
              )}

              {/* Items Table */}
              <div className="border-b-2 border-gray-900 pb-2 mb-2">
                <div className="flex font-semibold border-b border-gray-400 pb-1 mb-1">
                  <span className="w-8">Qty</span>
                  <span className="flex-1">Item</span>
                  <span className="w-16 text-right">Price</span>
                  <span className="w-16 text-right">Amt</span>
                </div>
                {receiptData?.cart.map((item, index) => (
                  <div key={index} className="flex py-1">
                    <span className="w-8">{item.quantity}</span>
                    <span className="flex-1 truncate pr-2">{item.product.name}</span>
                    <span className="w-16 text-right">{item.unitPrice.toFixed(2)}</span>
                    <span className="w-16 text-right">{item.totalAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-b-2 border-gray-900 pb-2 mb-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{receiptData?.subtotal.toFixed(2)}</span>
                </div>
                {receiptData && receiptData.totalDiscount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>-₹{receiptData.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>₹{receiptData?.totalGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-400 mt-1">
                  <span>TOTAL:</span>
                  <span>₹{lastSale.invoice?.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="border-b border-gray-400 pb-2 mb-2">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-semibold">{PAYMENT_METHODS.find(m => m.id === receiptData?.paymentMethod)?.label}</span>
                </div>
                {receiptData?.paymentMethod === 'cash' && receiptData.cashReceived > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Cash Received:</span>
                      <span>₹{receiptData.cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Change:</span>
                      <span>₹{receiptData.change.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="text-center mt-4">
                <p className="font-semibold text-sm">Thank You!</p>
                <p className="text-xs mt-1">Visit Again</p>
                {organization.name && (
                  <p className="text-xs mt-2">Powered by {organization.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Print Styles */}
          <style jsx global>{`
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body * {
                visibility: hidden;
              }
              .print-receipt, .print-receipt * {
                visibility: visible;
              }
              .print-receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: 80mm;
              }
            }
          `}</style>
        </>
      )}

      {/* UPI QR Payment Modal */}
      {showUpiQrModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">UPI Payment</h2>
              <button 
                onClick={() => {
                  if (upiPaymentStatus !== 'processing') {
                    setShowUpiQrModal(false)
                  }
                }} 
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={upiPaymentStatus === 'processing'}
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 text-center">
              {upiPaymentStatus === 'pending' && (
                <>
                  <p className="text-2xl font-bold text-indigo-600 mb-4">₹{total.toFixed(2)}</p>
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-4 inline-block relative w-48 h-48">
                    {upiQrDataUrl ? (
                      <img 
                        src={upiQrDataUrl} 
                        alt="UPI QR Code" 
                        className="object-contain w-full h-full p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Scan with any UPI app</p>
                  <p className="text-xs text-gray-500 mb-4">GPay, PhonePe, Paytm, BHIM, etc.</p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500">Pay to</p>
                    <p className="font-medium text-gray-900">{organization.upiId}</p>
                  </div>
                  <button
                    onClick={confirmUpiPayment}
                    disabled={processing}
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying Payment...
                      </span>
                    ) : (
                      "I've Received Payment"
                    )}
                  </button>
                </>
              )}

              {upiPaymentStatus === 'processing' && (
                <>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Verifying Payment...</h3>
                  <p className="text-gray-500">Please wait while we verify the transaction</p>
                </>
              )}

              {upiPaymentStatus === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</h3>
                  <p className="text-gray-500">Transaction completed successfully</p>
                </>
              )}

              {upiPaymentStatus === 'failed' && (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Failed</h3>
                  <p className="text-gray-500 mb-4">Please try again or use another payment method</p>
                  <button
                    onClick={() => setShowUpiQrModal(false)}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Serial Number Selection Modal */}
      {showSerialModal && selectedProductForSerial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Select Serial Numbers</h2>
                <p className="text-sm text-gray-500">{selectedProductForSerial.name}</p>
              </div>
              <button
                onClick={closeSerialModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[50vh]">
              {loadingSerials ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                  <p className="text-gray-600">Loading serial numbers...</p>
                </div>
              ) : availableSerials.length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No available serial numbers</p>
                  <p className="text-sm text-gray-500 mt-1">This product has no serial numbers in stock</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Available: {availableSerials.length} | Selected: {selectedSerials.length}
                  </p>
                  {availableSerials.map((serial) => (
                    <button
                      key={serial.id}
                      onClick={() => toggleSerialSelection(serial.serialNumber)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selectedSerials.includes(serial.serialNumber)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedSerials.includes(serial.serialNumber)
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedSerials.includes(serial.serialNumber) && (
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-mono font-medium text-gray-900">{serial.serialNumber}</p>
                        {serial.warrantyExpiry && (
                          <p className="text-xs text-gray-500">
                            Warranty: {new Date(serial.warrantyExpiry).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeSerialModal}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSerialSelection}
                disabled={selectedSerials.length === 0}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Add {selectedSerials.length} to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
