'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Save, FileText, Plus, Trash2,
    Receipt, Package, IndianRupee, User, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

interface Product {
    id: string
    name: string
    sku: string
    selling_price: number
    gstRate?: number
    hsnCode?: string
}

interface InvoiceItem {
    id?: string
    productId: string
    description: string
    hsnCode: string
    quantity: number
    unitPrice: number
    discount: number
    cgstRate: number
    sgstRate: number
    igstRate: number
    taxableAmount: number
    cgstAmount: number
    sgstAmount: number
    igstAmount: number
    totalAmount: number
}

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [products, setProducts] = useState<Product[]>([])

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        customerCity: '',
        customerState: '',
        customerPincode: '',
        customerGstNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
        terms: 'Payment due within 30 days from invoice date.',
        items: [] as InvoiceItem[]
    })

    const gstRates = [0, 3, 5, 12, 18, 28]

    useEffect(() => {
        fetchInvoiceAndProducts()
    }, [resolvedParams.id])

    const fetchInvoiceAndProducts = async () => {
        try {
            const [invoiceRes, productsRes] = await Promise.all([
                fetch(`/api/invoices/${resolvedParams.id}`),
                fetch('/api/products')
            ])

            if (!invoiceRes.ok) {
                if (invoiceRes.status === 404) {
                    router.push('/invoices')
                    return
                }
                throw new Error('Failed to fetch invoice')
            }

            const invoiceData = await invoiceRes.json()
            const invoice = invoiceData.invoice

            // Check if invoice can be edited
            if (invoice.status !== 'DRAFT') {
                setError('Only draft invoices can be edited')
                setTimeout(() => {
                    router.push(`/invoices/${resolvedParams.id}`)
                }, 2000)
                return
            }

            // Populate form data
            setFormData({
                customerName: invoice.customerName || '',
                customerEmail: invoice.customerEmail || '',
                customerPhone: invoice.customerPhone || '',
                customerAddress: invoice.customerAddress || '',
                customerCity: invoice.customerCity || '',
                customerState: invoice.customerState || '',
                customerPincode: invoice.customerPincode || '',
                customerGstNumber: invoice.customerGstNumber || '',
                invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : '',
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
                notes: invoice.notes || '',
                terms: invoice.terms || 'Payment due within 30 days from invoice date.',
                items: invoice.items.map((item: any) => ({
                    id: item.id,
                    productId: item.productId || '',
                    description: item.description,
                    hsnCode: item.hsnCode || '',
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    discount: Number(item.discount),
                    cgstRate: Number(item.cgstRate),
                    sgstRate: Number(item.sgstRate),
                    igstRate: Number(item.igstRate),
                    taxableAmount: Number(item.taxableAmount),
                    cgstAmount: Number(item.cgstAmount),
                    sgstAmount: Number(item.sgstAmount),
                    igstAmount: Number(item.igstAmount),
                    totalAmount: Number(item.totalAmount)
                }))
            })

            if (productsRes.ok) {
                const productsData = await productsRes.json()
                setProducts(productsData.products || [])
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addItem = () => {
        const newItem: InvoiceItem = {
            productId: '',
            description: '',
            hsnCode: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0,
            cgstRate: 0,
            sgstRate: 0,
            igstRate: 0,
            taxableAmount: 0,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            totalAmount: 0
        }
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }))
    }

    const removeItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }))
    }

    const updateItem = (index: number, field: string, value: any) => {
        const items = [...formData.items]
        const item = { ...items[index] } as InvoiceItem

        ;(item as any)[field] = value

        // If product selected, auto-fill details
        if (field === 'productId' && value) {
            const product = products.find(p => p.id === value)
            if (product) {
                item.description = product.name
                item.unitPrice = product.selling_price
                item.hsnCode = product.hsnCode || ''
                if (product.gstRate) {
                    const gstHalf = product.gstRate / 2
                    item.cgstRate = gstHalf
                    item.sgstRate = gstHalf
                }
            }
        }

        // Recalculate amounts
        const taxableAmount = item.quantity * item.unitPrice - (item.discount || 0)
        item.taxableAmount = taxableAmount
        item.cgstAmount = taxableAmount * item.cgstRate / 100
        item.sgstAmount = taxableAmount * item.sgstRate / 100
        item.igstAmount = taxableAmount * item.igstRate / 100
        item.totalAmount = taxableAmount + item.cgstAmount + item.sgstAmount + item.igstAmount

        items[index] = item
        setFormData(prev => ({ ...prev, items }))
    }

    // Calculate totals
    const subtotal = formData.items.reduce((sum, item) => sum + item.taxableAmount, 0)
    const totalCgst = formData.items.reduce((sum, item) => sum + item.cgstAmount, 0)
    const totalSgst = formData.items.reduce((sum, item) => sum + item.sgstAmount, 0)
    const totalIgst = formData.items.reduce((sum, item) => sum + item.igstAmount, 0)
    const totalGst = totalCgst + totalSgst + totalIgst
    const totalAmount = subtotal + totalGst

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const items = formData.items.map(item => ({
                id: item.id,
                productId: item.productId || null,
                description: item.description,
                hsnCode: item.hsnCode || null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                cgstRate: item.cgstRate,
                sgstRate: item.sgstRate,
                igstRate: item.igstRate
            }))

            // For now, delete and recreate invoice items
            // In production, you'd want to handle this more carefully
            const res = await fetch(`/api/invoices/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: formData.customerName,
                    invoiceDate: formData.invoiceDate,
                    dueDate: formData.dueDate || null,
                    notes: formData.notes,
                    terms: formData.terms
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update invoice')
            }

            router.push(`/invoices/${resolvedParams.id}`)
        } catch (err: any) {
            setError(err.message)
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <SidebarLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </SidebarLayout>
        )
    }

    return (
        <SidebarLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            href={`/invoices/${resolvedParams.id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Invoice</h1>
                            <p className="text-sm sm:text-base text-gray-500 mt-0.5 sm:mt-1">Update invoice details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 ml-11 sm:ml-0">
                        <Link
                            href={`/invoices/${resolvedParams.id}`}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={saving || formData.items.length === 0}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 text-sm"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                            Customer Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.customerName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Customer or Company Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    GST Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.customerGstNumber}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerGstNumber: e.target.value.toUpperCase() }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="customer@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.customerPhone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    value={formData.customerAddress}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={2}
                                    placeholder="Full address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <input
                                    type="text"
                                    value={formData.customerCity}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerCity: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Mumbai"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State
                                </label>
                                <input
                                    type="text"
                                    value={formData.customerState}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customerState: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Maharashtra"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                            Invoice Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Invoice Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.invoiceDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                            Line Items
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                            Note: Line items cannot be edited after invoice creation. Delete and recreate the invoice if needed.
                        </p>
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <table className="w-full min-w-[500px]">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-3 sm:px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">HSN</th>
                                        <th className="px-2 sm:px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Qty</th>
                                        <th className="px-2 sm:px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                                        <th className="px-3 sm:px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {formData.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3">
                                                <p className="font-medium text-sm sm:text-base">{item.description}</p>
                                            </td>
                                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm">{item.hsnCode || '-'}</td>
                                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-center text-sm">{item.quantity}</td>
                                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-right text-sm">₹{item.unitPrice.toFixed(2)}</td>
                                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-right font-medium text-sm">₹{item.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                        <div className="flex justify-end">
                            <div className="w-full sm:w-80 space-y-2 sm:space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                                    <span>CGST</span>
                                    <span>₹{totalCgst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                                    <span>SGST</span>
                                    <span>₹{totalSgst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                                    <span>IGST</span>
                                    <span>₹{totalIgst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2 text-sm sm:text-base">
                                    <span>Total GST</span>
                                    <span>₹{totalGst.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 border-t border-gray-200 pt-3">
                                    <span>Total Amount</span>
                                    <span>₹{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes & Terms */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                                    rows={3}
                                    placeholder="Additional notes..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Terms & Conditions
                                </label>
                                <textarea
                                    value={formData.terms}
                                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                                    rows={3}
                                    placeholder="Payment terms..."
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </SidebarLayout>
    )
}
