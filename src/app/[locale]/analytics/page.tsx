'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  BarChart3, TrendingUp, DollarSign, Package,
  AlertTriangle, ShoppingCart, ArrowUpRight, ArrowDownRight, RefreshCw,
  Download, Calendar, Target, CheckCircle, XCircle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, PieChart as RechartsPie, Pie, Cell,
  AreaChart, Area, ComposedChart
} from 'recharts'
import SidebarLayout from '@/components/SidebarLayout'
import { SubscriptionGate } from '@/components/SubscriptionGate'

const STOCK_COLORS = {
  inStock: '#22c55e',
  lowStock: '#f59e0b',
  outOfStock: '#ef4444'
}

interface AnalyticsData {
  sales: { total: number; count: number; average: number; byStatus: Record<string, number> }
  products: { total: number; totalValue: number; categories: number; withImages: number }
  stock: { total: number; lowStock: number; outOfStock: number; value: number; potentialRevenue: number }
  alerts: { total: number; byType: Record<string, number>; unread: number }
  revenueByDay: Array<{ date: string; revenue: number }>
  topProducts: Array<{ id: string; name: string; quantity: number; revenue: number }>
  categoryBreakdown: Array<{ category: string; count: number; value: number; revenue: number }>
  supplierPerformance: Array<{ supplierId: string; orders: number; total: number; items: number }>
  lowStockProducts: Array<{ id: string; name: string; current_quantity: number; reorder_point: number }>
  salesByHour: Array<{ hour: string; sales: number }>
  paymentMethods: Array<{ method: string; amount: number; count: number }>
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0)
const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value || 0)

const StatCard = ({ title, value, change, trend, icon: Icon, color, subtext }: any) => (
  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change && (
        <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </span>
      )}
    </div>
    <p className="text-sm text-gray-600 mb-1">{title}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload || {}
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('value') || entry.name.toLowerCase().includes('amount')
              ? formatCurrency(entry.value)
              : formatNumber(entry.value)}
          </p>
        ))}
        {data.revenue && data.count && (
          <p className="text-xs text-gray-500 mt-2 border-t pt-2">
            Avg: {formatCurrency(data.revenue / (data.count || 1))}
          </p>
        )}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [activeTab, setActiveTab] = useState('overview')
  const [error, setError] = useState<string | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/analytics?period=${period}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Analytics error:', err)
    } finally { setLoading(false) }
  }, [period])

  const handleExport = useCallback(async () => {
    try {
      const res = await fetch('/api/export?format=csv&scope=all', {
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Export failed')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stockalert-analytics-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
    }
  }, [])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  const stockStatus = [
    { label: 'In Stock', value: (data?.stock.total || 0) - (data?.stock.lowStock || 0) - (data?.stock.outOfStock || 0), color: STOCK_COLORS.inStock, icon: CheckCircle },
    { label: 'Low Stock', value: data?.stock.lowStock || 0, color: STOCK_COLORS.lowStock, icon: AlertTriangle },
    { label: 'Out of Stock', value: data?.stock.outOfStock || 0, color: STOCK_COLORS.outOfStock, icon: XCircle },
  ]

  const statCards = [
    { title: 'Total Revenue', value: formatCurrency(data?.sales.total || 0), change: '+12.5%', trend: 'up', icon: DollarSign, color: 'from-green-500 to-green-600', subtext: 'This period' },
    { title: 'Total Orders', value: formatNumber(data?.sales.count || 0), change: '+8.2%', trend: 'up', icon: ShoppingCart, color: 'from-blue-500 to-blue-600', subtext: `${data?.sales.count || 0} transactions` },
    { title: 'Avg Order Value', value: formatCurrency(data?.sales.average || 0), change: '-2.1%', trend: 'down', icon: TrendingUp, color: 'from-purple-500 to-purple-600', subtext: 'Per transaction' },
    { title: 'Inventory Value', value: formatCurrency(data?.stock.value || 0), change: '+5.3%', trend: 'up', icon: Package, color: 'from-orange-500 to-orange-600', subtext: `${formatNumber(data?.stock.total || 0)} items` },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'stock', label: 'Stock', icon: AlertTriangle },
    { id: 'performance', label: 'Performance', icon: Target },
  ]

  const periodLabels: Record<string, string> = {
    '7': 'Last 7 Days',
    '30': 'Last 30 Days',
    '90': 'Last 90 Days',
    '365': 'Last Year'
  }

  if (loading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-indigo-300" />
              </div>
            </div>
            <p className="text-gray-600 font-medium">Loading analytics...</p>
          </div>
        </div>
      </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <SubscriptionGate>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {error && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
                <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 cursor-pointer">
                  <span className="text-xl">&times;</span>
                </button>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-sm text-gray-500">Track your business performance</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                  >
                    <Calendar className="w-5 h-5 text-gray-500" />
                    {periodLabels[period]}
                  </button>
                  {showDatePicker && (
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-10 min-w-[180px]">
                      {['7', '30', '90', '365'].map((p) => (
                        <button
                          key={p}
                          onClick={() => { setPeriod(p); setShowDatePicker(false); }}
                          className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                            period === p ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          {periodLabels[p]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  onClick={fetchAnalytics} 
                  className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all cursor-pointer border border-gray-200 shadow-sm"
                  title="Refresh data"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all cursor-pointer shadow-lg shadow-indigo-200">
                  <Download className="w-5 h-5" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-700 shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    } cursor-pointer`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pb-8">
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, i) => (
                      <StatCard key={i} {...stat} />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                          Revenue Trend
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">vs previous period</span>
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <ArrowUpRight className="w-4 h-4" /> 12.5%
                          </span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={data?.revenueByDay || []}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 11 }} 
                            stroke="#9ca3af" 
                            tickFormatter={(v) => {
                              const date = new Date(v)
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            }}
                          />
                          <YAxis 
                            tick={{ fontSize: 11 }} 
                            stroke="#9ca3af" 
                            tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} 
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#6366f1" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                        Stock Status
                      </h3>
                      <div className="mb-6">
                        <ResponsiveContainer width="100%" height={180}>
                          <RechartsPie>
                            <Pie
                              data={stockStatus}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {stockStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {stockStatus.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                              <span className="text-sm font-medium text-gray-700">{item.label}</span>
                            </div>
                              <span className="font-bold text-gray-900">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                        Top Selling Products
                      </h3>
                      <div className="space-y-3">
                        {(data?.topProducts || []).slice(0, 8).map((product, i) => (
                          <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-sm text-gray-500">{formatNumber(product.quantity)} sold</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
                        Low Stock Alerts
                      </h3>
                      {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                        <div className="space-y-3">
                          {data.lowStockProducts.slice(0, 8).map((product) => (
                            <Link 
                              key={product.id}
                              href={`/products/${product.id}/edit`}
                              className="flex items-center gap-4 p-3 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer border border-amber-100"
                            >
                              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                <p className="text-sm text-amber-700">
                                  {product.current_quantity} left (reorder at {product.reorder_point})
                                </p>
                              </div>
                              <span className="px-2 py-1 bg-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                                Low
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-gray-900 font-medium">All products stocked!</p>
                          <p className="text-sm text-gray-500">No low stock alerts at the moment</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                      Category Performance
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data?.categoryBreakdown || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                        <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={100} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-800">{formatCurrency(data?.sales.total || 0)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">Avg Daily</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {formatCurrency((data?.sales.total || 0) / Math.max(1, parseInt(period)))}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium mb-1">Best Day</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {formatCurrency(Math.max(...(data?.revenueByDay.map(d => d.revenue) || [0])))}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
                      <p className="text-sm text-orange-700 font-medium mb-1">Transactions</p>
                      <p className="text-2xl font-bold text-orange-800">{formatNumber(data?.sales.count || 0)}</p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                        Revenue Over Time
                      </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={400}>
                      <ComposedChart data={data?.revenueByDay || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11 }} 
                          stroke="#9ca3af"
                          tickFormatter={(v) => {
                            const date = new Date(v)
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          }}
                        />
                        <YAxis 
                          tick={{ fontSize: 11 }} 
                          stroke="#9ca3af"
                          tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.8} />
                        <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {data?.paymentMethods && data.paymentMethods.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                        Payment Methods
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.paymentMethods.map((method, i) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                {method.method === 'cash' ? '💵' : method.method === 'card' ? '💳' : '🏦'}
                              </div>
                              <span className="font-semibold text-gray-900 capitalize">{method.method}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Amount</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(method.amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Transactions</span>
                                <span className="font-semibold text-gray-900">{formatNumber(method.count)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Avg</span>
                                <span className="font-semibold text-green-600">{formatCurrency(method.amount / Math.max(1, method.count))}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5">
                      <p className="text-sm text-gray-600 mb-1">Total Products</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.products.total || 0)}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5">
                      <p className="text-sm text-gray-600 mb-1">Categories</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.products.categories || 0)}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5">
                      <p className="text-sm text-gray-600 mb-1">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(data?.products.totalValue || 0)}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-5">
                      <p className="text-sm text-gray-600 mb-1">With Images</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(data?.products.withImages || 0)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                        Products by Category
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.categoryBreakdown || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                        Product Value by Category
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data?.categoryBreakdown || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value: number | undefined) => formatCurrency(value || 0)} />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                      Top Products by Revenue
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rank</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Sold</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data?.topProducts || []).slice(0, 15).map((product, i) => (
                            <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                              <td className="py-3 px-4">
                                <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                                  i === 0 ? 'bg-amber-100 text-amber-700' :
                                  i === 1 ? 'bg-gray-200 text-gray-700' :
                                  i === 2 ? 'bg-orange-100 text-orange-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {i + 1}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <span className="font-medium text-gray-900">{product.name}</span>
                                </div>
                              </td>
                              <td className="text-right py-3 px-4 text-gray-600">{formatNumber(product.quantity)}</td>
                              <td className="text-right py-3 px-4 font-bold text-green-600">{formatCurrency(product.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stock' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm text-green-700 font-medium">In Stock</span>
                      </div>
                      <p className="text-3xl font-bold text-green-800">
                        {(data?.stock.total || 0) - (data?.stock.lowStock || 0) - (data?.stock.outOfStock || 0)}
                      </p>
                      <p className="text-sm text-green-600 mt-1">items available</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm text-amber-700 font-medium">Low Stock</span>
                      </div>
                      <p className="text-3xl font-bold text-amber-800">{data?.stock.lowStock || 0}</p>
                      <p className="text-sm text-amber-600 mt-1">need attention</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm text-red-700 font-medium">Out of Stock</span>
                      </div>
                      <p className="text-3xl font-bold text-red-800">{data?.stock.outOfStock || 0}</p>
                      <p className="text-sm text-red-600 mt-1">need restock</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm text-purple-700 font-medium">Total Value</span>
                      </div>
                      <p className="text-3xl font-bold text-purple-800">{formatCurrency(data?.stock.value || 0)}</p>
                      <p className="text-sm text-purple-600 mt-1">inventory worth</p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                        Stock Distribution by Category
                      </h3>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={data?.categoryBreakdown || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Products" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="value" name="Value ($)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
                      Products Needing Restock
                    </h3>
                    {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Current</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Reorder Point</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.lowStockProducts.map((product) => (
                              <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="py-3 px-4 font-medium text-gray-900">{product.name}</td>
                                <td className="text-right py-3 px-4 text-gray-600">{product.current_quantity}</td>
                                <td className="text-right py-3 px-4 text-gray-600">{product.reorder_point}</td>
                                <td className="text-right py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    product.current_quantity === 0 
                                      ? 'bg-red-100 text-red-700' 
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    {product.current_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                  </span>
                                </td>
                                <td className="text-right py-3 px-4">
                                  <Link 
                                    href={`/products/${product.id}/edit`}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer"
                                  >
                                    Edit
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <p className="text-xl font-semibold text-gray-900 mb-2">All Stocked Up!</p>
                        <p className="text-gray-500">No products need restocking at the moment</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-green-500 rounded-full"></span>
                        Revenue Growth
                      </h3>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900">+12.5%</span>
                        <span className="text-sm text-green-600 mb-1">vs last period</span>
                      </div>
                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Performance Score: 75/100</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
                        Order Fulfillment
                      </h3>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900">98.5%</span>
                        <span className="text-sm text-green-600 mb-1">success rate</span>
                      </div>
                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: '98.5%' }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{data?.sales.count || 0} orders processed</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                        Inventory Turnover
                      </h3>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900">4.2x</span>
                        <span className="text-sm text-gray-500 mb-1">per month</span>
                      </div>
                      <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Good turnover rate</p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                      Performance Metrics Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-indigo-600">{formatCurrency(data?.sales.average || 0)}</p>
                        <p className="text-sm text-gray-600 mt-1">Avg Order Value</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-indigo-600">{formatCurrency(data?.stock.potentialRevenue || 0)}</p>
                        <p className="text-sm text-gray-600 mt-1">Potential Revenue</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-indigo-600">{formatNumber(data?.products.total || 0)}</p>
                        <p className="text-sm text-gray-600 mt-1">Active Products</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-3xl font-bold text-indigo-600">{formatNumber(data?.alerts.unread || 0)}</p>
                        <p className="text-sm text-gray-600 mt-1">Pending Alerts</p>
                      </div>
                    </div>
                  </div>

                  {data?.supplierPerformance && data.supplierPerformance.length > 0 && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                        Supplier Performance
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Supplier</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Orders</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Items</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Total Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.supplierPerformance.map((supplier, i) => (
                              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                <td className="py-3 px-4 font-medium text-gray-900">{supplier.supplierId}</td>
                                <td className="text-right py-3 px-4 text-gray-600">{formatNumber(supplier.orders)}</td>
                                <td className="text-right py-3 px-4 text-gray-600">{formatNumber(supplier.items)}</td>
                                <td className="text-right py-3 px-4 font-semibold text-green-600">{formatCurrency(supplier.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </SubscriptionGate>
    </SidebarLayout>
  )
}
