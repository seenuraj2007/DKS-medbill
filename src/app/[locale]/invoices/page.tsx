'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
    Plus, FileText, Search, Filter,
    Download, Eye, Edit, Trash2, ChevronLeft, ChevronRight,
    Receipt, Calendar, IndianRupee, X, MoreHorizontal, ArrowRight,
    TrendingUp, Users, CheckCircle2, Clock, AlertCircle, CheckCircle,
    RefreshCw
} from 'lucide-react'
import SidebarLayout from '@/components/SidebarLayout'

interface Invoice {
    id: string
    invoiceNumber: string
    invoiceDate: string
    customerName: string
    totalAmount: number
    status: string
    createdAt: string
}

// Helper to get relative time
const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [lastRefresh, setLastRefresh] = useState(Date.now())

    const fetchInvoices = useCallback(async (skipLoading = false) => {
        try {
            if (!skipLoading) setLoading(true)
            const timestamp = Date.now()
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                t: timestamp.toString()
            })
            if (statusFilter !== 'all') {
                params.append('status', statusFilter)
            }

            const res = await fetch(`/api/invoices?${params}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            })
            if (!res.ok) throw new Error('Failed to fetch invoices')

            const data = await res.json()
            setInvoices([]) // Clear first to force re-render
            setTimeout(() => {
                setInvoices(data.invoices || [])
                setTotalPages(data.pagination?.totalPages || 1)
            }, 0)
            setLastRefresh(Date.now())
        } catch (err: any) {
            setError(err.message)
        } finally {
            if (!skipLoading) setLoading(false)
        }
    }, [page, statusFilter])

    // Fetch on mount and when dependencies change
    useEffect(() => {
        fetchInvoices()
    }, [fetchInvoices])

    // Auto-refresh when page becomes visible (user returns from POS)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Refresh data when user comes back to this tab
                fetchInvoices(true)
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [fetchInvoices])

    // Poll for new invoices every 5 seconds when on first page
    useEffect(() => {
        if (page !== 1) return
        
        const interval = setInterval(() => {
            fetchInvoices(true)
        }, 5000)

        return () => clearInterval(interval)
    }, [fetchInvoices, page])

    const deleteInvoice = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return

        try {
            const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete invoice')
            fetchInvoices(false)
        } catch (err: any) {
            setError(err.message)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-200'
            case 'ISSUED': return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'PAID': return 'bg-green-50 text-green-700 border-green-200'
            case 'OVERDUE': return 'bg-red-50 text-red-700 border-red-200'
            case 'CANCELLED': return 'bg-gray-100 text-gray-500 border-gray-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    // More vibrant status colors for mobile
    const getStatusColorMobile = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-500 text-white'
            case 'ISSUED': return 'bg-blue-500 text-white'
            case 'PAID': return 'bg-green-500 text-white'
            case 'OVERDUE': return 'bg-red-500 text-white'
            case 'CANCELLED': return 'bg-gray-400 text-white'
            default: return 'bg-gray-500 text-white'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle className="w-3 h-3" />
            case 'OVERDUE': return <AlertCircle className="w-3 h-3" />
            case 'ISSUED': return <Clock className="w-3 h-3" />
            case 'DRAFT': return <FileText className="w-3 h-3" />
            default: return <FileText className="w-3 h-3" />
        }
    }

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-500'
            case 'ISSUED': return 'bg-blue-500'
            case 'DRAFT': return 'bg-gray-400'
            case 'OVERDUE': return 'bg-red-500'
            case 'CANCELLED': return 'bg-gray-300'
            default: return 'bg-gray-400'
        }
    }

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-50'
            case 'ISSUED': return 'bg-blue-50'
            case 'DRAFT': return 'bg-gray-100'
            case 'OVERDUE': return 'bg-red-50'
            case 'CANCELLED': return 'bg-gray-100'
            default: return 'bg-gray-100'
        }
    }

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'text-green-700'
            case 'ISSUED': return 'text-blue-700'
            case 'DRAFT': return 'text-gray-700'
            case 'OVERDUE': return 'text-red-700'
            case 'CANCELLED': return 'text-gray-500'
            default: return 'text-gray-700'
        }
    }

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase())
    )

    const statusOptions = [
        { value: 'all', label: 'All Status', color: 'bg-gray-500' },
        { value: 'DRAFT', label: 'Draft', color: 'bg-gray-500' },
        { value: 'ISSUED', label: 'Issued', color: 'bg-blue-500' },
        { value: 'PAID', label: 'Paid', color: 'bg-green-500' },
        { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-500' },
        { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-400' },
    ]

    return (
        <SidebarLayout>
            <div className="max-w-7xl mx-auto pb-20 sm:pb-0">
                {/* Desktop Header */}
                <div className="hidden sm:flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                        <p className="text-gray-500 mt-1">Manage GST-compliant invoices</p>
                    </div>
                    <Link
                        href="/invoices/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        Create Invoice
                    </Link>
                </div>

                {/* Mobile App Header */}
                <div className="sm:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
                            <p className="text-xs text-gray-500">{filteredInvoices.length} invoices</p>
                        </div>
                        <div className="flex items-center gap-2">
                <button
                        onClick={() => fetchInvoices()}
                        className="p-2.5 rounded-full bg-gray-100 text-gray-600 active:scale-95 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`p-2.5 rounded-full transition-all ${statusFilter !== 'all' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                    <Link
                        href="/invoices/new"
                        className="p-2.5 bg-indigo-600 rounded-full text-white shadow-md shadow-indigo-500/30 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                    </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Stats Cards */}
                <div className="sm:hidden mt-16 mb-4">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-3 text-white">
                            <div className="flex items-center gap-1 mb-1">
                                <FileText className="w-3.5 h-3.5 opacity-80" />
                                <span className="text-[10px] font-medium opacity-80">Total</span>
                            </div>
                            <p className="text-lg font-bold">{invoices.length}</p>
                        </div>
                        <div className="bg-green-500 rounded-2xl p-3 text-white">
                            <div className="flex items-center gap-1 mb-1">
                                <CheckCircle className="w-3.5 h-3.5 opacity-80" />
                                <span className="text-[10px] font-medium opacity-80">Paid</span>
                            </div>
                            <p className="text-lg font-bold">{invoices.filter(i => i.status === 'PAID').length}</p>
                        </div>
                        <div className="bg-orange-500 rounded-2xl p-3 text-white">
                            <div className="flex items-center gap-1 mb-1">
                                <Clock className="w-3.5 h-3.5 opacity-80" />
                                <span className="text-[10px] font-medium opacity-80">Pending</span>
                            </div>
                            <p className="text-lg font-bold">{invoices.filter(i => i.status === 'ISSUED' || i.status === 'DRAFT').length}</p>
                        </div>
                    </div>
                </div>

                {/* Desktop Filters */}
                <div className="hidden sm:block bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by invoice number or customer..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value)
                                setPage(1)
                            }}
                            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Status</option>
                            <option value="DRAFT">Draft</option>
                            <option value="ISSUED">Issued</option>
                            <option value="PAID">Paid</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="sm:hidden mb-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-10 py-3.5 bg-gray-100 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-base"
                        />
                        {search ? (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center"
                            >
                                <X className="w-3.5 h-3.5 text-white" />
                            </button>
                        ) : (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-md">⌘K</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Invoices List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading invoices...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500">{error}</p>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No invoices found</p>
                        <Link
                            href="/invoices/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Invoice
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredInvoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/invoices/${invoice.id}`}
                                                    className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
                                                >
                                                    {invoice.invoiceNumber}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {invoice.customerName}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                ₹{Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/invoices/${invoice.id}`}
                                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                        title="View"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/invoices/${invoice.id}/edit`}
                                                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    {invoice.status === 'DRAFT' && (
                                                        <button
                                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                            title="Delete"
                                                            onClick={() => deleteInvoice(invoice.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Desktop Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">
                                        Page {page} of {totalPages}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile App Card Layout */}
                        <div className="sm:hidden space-y-3 pb-24">
                            {filteredInvoices.map((invoice, index) => (
                                <Link
                                    key={invoice.id}
                                    href={`/invoices/${invoice.id}`}
                                    className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2 h-2 rounded-full ${getStatusDotColor(invoice.status)}`} />
                                                <span className="text-sm font-bold text-gray-900">
                                                    {invoice.invoiceNumber}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate mb-2">
                                                {invoice.customerName}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBgColor(invoice.status)} ${getStatusTextColor(invoice.status)}`}>
                                                    {getStatusIcon(invoice.status)}
                                                    {invoice.status}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {getRelativeTime(invoice.invoiceDate)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{Number(invoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                                            </p>
                                            <ArrowRight className="w-4 h-4 text-gray-300 mt-2 ml-auto" />
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* Mobile Load More / Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-4 pt-4">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-3 bg-white rounded-full shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-2 h-2 rounded-full transition-all ${
                                                    page === i + 1 ? 'bg-indigo-600 w-4' : 'bg-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-3 bg-white rounded-full shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            )}

                            {/* End of list indicator */}
                            <div className="text-center py-6">
                                <p className="text-xs text-gray-400">
                                    Showing {filteredInvoices.length} of {invoices.length} invoices
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {/* Mobile Filter Bottom Sheet */}
                {isFilterOpen && (
                    <>
                        <div 
                            className="sm:hidden fixed inset-0 bg-black/50 z-50"
                            onClick={() => setIsFilterOpen(false)}
                        />
                        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-auto">
                            <div className="p-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-3xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Filter by Status</h3>
                                    <button
                                        onClick={() => setIsFilterOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setStatusFilter(option.value)
                                            setPage(1)
                                            setIsFilterOpen(false)
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                            statusFilter === option.value
                                                ? 'bg-indigo-50 border-2 border-indigo-500'
                                                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${option.color}`} />
                                            <span className={`font-medium ${
                                                statusFilter === option.value ? 'text-indigo-900' : 'text-gray-700'
                                            }`}>
                                                {option.label}
                                            </span>
                                        </div>
                                        {statusFilter === option.value && (
                                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="p-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setStatusFilter('all')
                                        setPage(1)
                                        setIsFilterOpen(false)
                                    }}
                                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </SidebarLayout>
    )
}
