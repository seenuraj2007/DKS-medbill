'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Plus, FileText, Search, Filter,
    Download, Eye, Edit, Trash2, ChevronLeft, ChevronRight,
    Receipt, Calendar, IndianRupee
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

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchInvoices()
    }, [page, statusFilter])

    const fetchInvoices = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20'
            })
            if (statusFilter !== 'all') {
                params.append('status', statusFilter)
            }

            const res = await fetch(`/api/invoices?${params}`)
            if (!res.ok) throw new Error('Failed to fetch invoices')

            const data = await res.json()
            setInvoices(data.invoices || [])
            setTotalPages(data.pagination?.totalPages || 1)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const deleteInvoice = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return

        try {
            const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete invoice')
            fetchInvoices()
        } catch (err: any) {
            setError(err.message)
        }
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

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <SidebarLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
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

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
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
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
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

                        {/* Pagination */}
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
                )}
            </div>
        </SidebarLayout>
    )
}
