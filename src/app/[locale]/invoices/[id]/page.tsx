'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import {
    ArrowLeft, Printer, Download, Edit, CheckCircle, XCircle,
    FileText, Building2, User, MapPin, Phone, Mail, Calendar,
    IndianRupee, Package, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import SidebarLayout from '@/components/SidebarLayout'

interface InvoiceItem {
    id: string
    description: string
    hsnCode: string | null
    quantity: number
    unitPrice: number
    discount: number
    taxableAmount: number
    cgstRate: number
    sgstRate: number
    igstRate: number
    cgstAmount: number
    sgstAmount: number
    igstAmount: number
    totalAmount: number
}

interface Invoice {
    id: string
    invoiceNumber: string
    invoiceDate: string
    dueDate: string | null
    status: string
    businessName: string
    businessAddress: string | null
    businessCity: string | null
    businessState: string | null
    businessPincode: string | null
    businessGstNumber: string | null
    customerName: string
    customerAddress: string | null
    customerCity: string | null
    customerState: string | null
    customerPincode: string | null
    customerGstNumber: string | null
    subtotal: number
    totalCgst: number
    totalSgst: number
    totalIgst: number
    totalGst: number
    totalAmount: number
    notes: string | null
    terms: string | null
    items: InvoiceItem[]
    createdAt: string
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        fetchInvoice()
    }, [resolvedParams.id])

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/invoices/${resolvedParams.id}`)
            if (!res.ok) {
                if (res.status === 404) {
                    router.push('/invoices')
                    return
                }
                throw new Error('Failed to fetch invoice')
            }
            const data = await res.json()
            setInvoice(data.invoice)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (newStatus: string) => {
        setUpdating(true)
        try {
            const res = await fetch(`/api/invoices/${resolvedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Failed to update status')
            fetchInvoice()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUpdating(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-700'
            case 'ISSUED': return 'bg-blue-100 text-blue-700'
            case 'PAID': return 'bg-green-100 text-green-700'
            case 'OVERDUE': return 'bg-red-100 text-red-700'
            case 'CANCELLED': return 'bg-gray-100 text-gray-500'
            default: return 'bg-gray-100 text-gray-700'
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

    if (error || !invoice) {
        return (
            <SidebarLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <p className="text-red-500">{error || 'Invoice not found'}</p>
                        <Link href="/invoices" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Invoices
                        </Link>
                    </div>
                </div>
            </SidebarLayout>
        )
    }

    return (
        <SidebarLayout>
            <div className="max-w-5xl mx-auto print:max-w-none">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/invoices"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
                            <span className={`inline-block mt-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        {invoice.status === 'DRAFT' && (
                            <>
                                <Link
                                    href={`/invoices/${invoice.id}/edit`}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => updateStatus('ISSUED')}
                                    disabled={updating}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark as Issued
                                </button>
                            </>
                        )}
                        {invoice.status === 'ISSUED' && (
                            <button
                                onClick={() => updateStatus('PAID')}
                                disabled={updating}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Paid
                            </button>
                        )}
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="bg-white rounded-xl border border-gray-200 p-8 print:border-none print:p-0">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">TAX INVOICE</h2>
                            <p className="text-gray-600">{invoice.invoiceNumber}</p>
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <span className="text-gray-600">Invoice Date:</span>
                                <p className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</p>
                            </div>
                            {invoice.dueDate && (
                                <div>
                                    <span className="text-gray-600">Due Date:</span>
                                    <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Business & Customer Details */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                From
                            </h3>
                            <p className="font-bold text-lg">{invoice.businessName}</p>
                            {invoice.businessAddress && <p className="text-gray-600">{invoice.businessAddress}</p>}
                            {(invoice.businessCity || invoice.businessState) && (
                                <p className="text-gray-600">
                                    {invoice.businessCity}{invoice.businessCity && invoice.businessState && ', '}{invoice.businessState}
                                    {invoice.businessPincode && ` - ${invoice.businessPincode}`}
                                </p>
                            )}
                            {invoice.businessGstNumber && (
                                <p className="mt-2 text-sm">
                                    <span className="font-medium">GSTIN:</span> {invoice.businessGstNumber}
                                </p>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Bill To
                            </h3>
                            <p className="font-bold text-lg">{invoice.customerName}</p>
                            {invoice.customerAddress && <p className="text-gray-600">{invoice.customerAddress}</p>}
                            {(invoice.customerCity || invoice.customerState) && (
                                <p className="text-gray-600">
                                    {invoice.customerCity}{invoice.customerCity && invoice.customerState && ', '}{invoice.customerState}
                                    {invoice.customerPincode && ` - ${invoice.customerPincode}`}
                                </p>
                            )}
                            {invoice.customerGstNumber && (
                                <p className="mt-2 text-sm">
                                    <span className="font-medium">GSTIN:</span> {invoice.customerGstNumber}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100 border-b-2 border-gray-200">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">#</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">HSN</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Qty</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Price</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {invoice.items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{item.description}</p>
                                            {(Number(item.cgstAmount) > 0 || Number(item.sgstAmount) > 0) && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    CGST @ {item.cgstRate}% = ₹{Number(item.cgstAmount).toFixed(2)}, 
                                                    SGST @ {item.sgstRate}% = ₹{Number(item.sgstAmount).toFixed(2)}
                                                </p>
                                            )}
                                            {Number(item.igstAmount) > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    IGST @ {item.igstRate}% = ₹{Number(item.igstAmount).toFixed(2)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-600">{item.hsnCode || '-'}</td>
                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right">₹{Number(item.unitPrice).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right font-medium">₹{Number(item.totalAmount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-80 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
                            </div>
                            {Number(invoice.totalCgst) > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>CGST</span>
                                    <span>₹{Number(invoice.totalCgst).toFixed(2)}</span>
                                </div>
                            )}
                            {Number(invoice.totalSgst) > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>SGST</span>
                                    <span>₹{Number(invoice.totalSgst).toFixed(2)}</span>
                                </div>
                            )}
                            {Number(invoice.totalIgst) > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>IGST</span>
                                    <span>₹{Number(invoice.totalIgst).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600 border-t border-gray-200 pt-2">
                                <span>Total GST</span>
                                <span>₹{Number(invoice.totalGst).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-900 pt-3">
                                <span>Total Amount</span>
                                <span>₹{Number(invoice.totalAmount).toFixed(2)}</span>
                            </div>
                            <div className="text-right text-sm text-gray-600 mt-2">
                                (Rupees {numberToWords(Number(invoice.totalAmount))} Only)
                            </div>
                        </div>
                    </div>

                    {/* Notes & Terms */}
                    {(invoice.notes || invoice.terms) && (
                        <div className="border-t border-gray-200 pt-6 space-y-4">
                            {invoice.notes && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Notes</h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{invoice.notes}</p>
                                </div>
                            )}
                            {invoice.terms && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Terms & Conditions</h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{invoice.terms}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Signature Area */}
                    <div className="mt-12 pt-8 border-t border-gray-200 print:block">
                        <div className="flex justify-end">
                            <div className="text-center">
                                <div className="w-48 h-16 border-b border-gray-400 mb-2"></div>
                                <p className="text-sm font-medium">Authorized Signature</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    )
}

// Helper function to convert number to words
function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    const convertLessThanOneThousand = (n: number): string => {
        if (n === 0) return ''
        if (n < 10) return ones[n]
        if (n < 20) return teens[n - 10]
        if (n < 100) {
            return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
        }
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertLessThanOneThousand(n % 100) : '')
    }
    
    if (num === 0) return 'Zero'
    
    const rupees = Math.floor(num)
    const paise = Math.round((num - rupees) * 100)
    
    let result = ''
    
    if (rupees > 0) {
        const crores = Math.floor(rupees / 10000000)
        const lakhs = Math.floor((rupees % 10000000) / 100000)
        const thousands = Math.floor((rupees % 100000) / 1000)
        const hundreds = rupees % 1000
        
        if (crores > 0) {
            result += convertLessThanOneThousand(crores) + ' Crore '
        }
        if (lakhs > 0) {
            result += convertLessThanOneThousand(lakhs) + ' Lakh '
        }
        if (thousands > 0) {
            result += convertLessThanOneThousand(thousands) + ' Thousand '
        }
        if (hundreds > 0) {
            result += convertLessThanOneThousand(hundreds)
        }
        
        result += ' Rupees'
    }
    
    if (paise > 0) {
        if (rupees > 0) result += ' and '
        result += convertLessThanOneThousand(paise) + ' Paise'
    }
    
    return result.trim()
}
