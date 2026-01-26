import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/serverSupabase'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '30'

    const days = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString()

    const safeGetData = async (fn: () => Promise<unknown>) => {
      try { return await fn() } catch (e) { console.error(e); return null }
    }

    const [
      salesData,
      productsData,
      stockData,
      alertsData,
      revenueByDay,
      topProducts,
      categoryBreakdown,
      supplierPerformance,
    ] = await Promise.all([
      safeGetData(() => getSalesAnalytics(user.id, startDateStr)),
      safeGetData(() => getProductsAnalytics(user.id)),
      safeGetData(() => getStockAnalytics(user.id)),
      safeGetData(() => getAlertsAnalytics(user.id)),
      safeGetData(() => getRevenueByDay(user.id, startDateStr)),
      safeGetData(() => getTopProducts(user.id, startDateStr)),
      safeGetData(() => getCategoryBreakdown(user.id)),
      safeGetData(() => getSupplierPerformance(user.id, startDateStr)),
    ])

    return NextResponse.json({
      sales: salesData || { total: 0, count: 0, average: 0, byStatus: {} },
      products: productsData || { total: 0, totalValue: 0, categories: 0, withImages: 0 },
      stock: stockData || { total: 0, lowStock: 0, outOfStock: 0, value: 0, potentialRevenue: 0 },
      alerts: alertsData || { total: 0, byType: {}, unread: 0 },
      revenueByDay: revenueByDay || [],
      topProducts: topProducts || [],
      categoryBreakdown: categoryBreakdown || [],
      supplierPerformance: supplierPerformance || [],
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

async function getSalesAnalytics(userId: string, startDate: string) {
  const { data, error } = await supabaseAdmin!
    .from('sales')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate)

  if (error) return { total: 0, count: 0, average: 0, byStatus: {} }

  const total = data.reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0)
  const byStatus = data.reduce((acc, sale) => {
    acc[sale.status] = (acc[sale.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total: Math.round(total * 100) / 100,
    count: data.length,
    average: data.length > 0 ? Math.round((total / data.length) * 100) / 100 : 0,
    byStatus,
  }
}

async function getProductsAnalytics(userId: string) {
  const { data, error } = await supabaseAdmin!
    .from('products')
    .select('*')
    .eq('user_id', userId)

  if (error) return { total: 0, totalValue: 0, categories: 0 }

  const totalValue = data.reduce((sum, product) => {
    const cost = parseFloat(product.unit_cost || '0')
    const quantity = product.current_quantity || 0
    return sum + (cost * quantity)
  }, 0)

  const categories = [...new Set(data.map(p => p.category).filter(Boolean))].length

  return {
    total: data.length,
    totalValue: Math.round(totalValue * 100) / 100,
    categories,
    withImages: data.filter(p => p.image_url).length,
  }
}

async function getStockAnalytics(userId: string) {
  const { data, error } = await supabaseAdmin!
    .from('products')
    .select('current_quantity, reorder_point, unit_cost, selling_price')
    .eq('user_id', userId)

  if (error) return { total: 0, lowStock: 0, outOfStock: 0, value: 0 }

  const total = data.reduce((sum, p) => sum + (p.current_quantity || 0), 0)
  const lowStock = data.filter(p => p.current_quantity <= p.reorder_point && p.current_quantity > 0).length
  const outOfStock = data.filter(p => p.current_quantity === 0).length
  const value = data.reduce((sum, p) => sum + ((p.current_quantity || 0) * parseFloat(p.unit_cost || '0')), 0)

  return {
    total,
    lowStock,
    outOfStock,
    value: Math.round(value * 100) / 100,
    potentialRevenue: Math.round(data.reduce((sum, p) => 
      sum + ((p.current_quantity || 0) * parseFloat(p.selling_price || '0')), 0) * 100) / 100,
  }
}

async function getAlertsAnalytics(userId: string) {
  const { data, error } = await supabaseAdmin!
    .from('alerts')
    .select('*')
    .eq('user_id', userId)

  if (error) return { total: 0, byType: {} }

  const byType = data.reduce((acc, alert) => {
    acc[alert.type] = (acc[alert.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    total: data.length,
    byType,
    unread: data.filter(a => !a.read_at).length,
  }
}

async function getRevenueByDay(userId: string, startDate: string) {
  const { data, error } = await supabaseAdmin!
    .from('sales')
    .select('total_amount, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate)
    .order('created_at', { ascending: true })

  if (error) return []

  const byDay = data.reduce((acc, sale) => {
    const date = sale.created_at.split('T')[0]
    acc[date] = (acc[date] || 0) + parseFloat(sale.total_amount || '0')
    return acc
  }, {} as Record<string, number>)

  return Object.entries(byDay).map(([date, amount]) => ({
    date,
    revenue: Math.round(amount * 100) / 100,
  }))
}

async function getTopProducts(userId: string, startDate: string) {
  const { data, error } = await supabaseAdmin!
    .from('sales')
    .select('items, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate)

  if (error) return []

  const productSales: Record<string, { quantity: number; revenue: number; name: string }> = {}

  for (const sale of data) {
    if (sale.items && Array.isArray(sale.items)) {
      for (const item of sale.items) {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = { quantity: 0, revenue: 0, name: item.name || 'Unknown' }
        }
        productSales[item.product_id].quantity += item.quantity || 0
        productSales[item.product_id].revenue += parseFloat(item.total || '0')
      }
    }
  }

  return Object.entries(productSales)
    .map(([id, stats]) => ({ id, ...stats, revenue: Math.round(stats.revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
}

async function getCategoryBreakdown(userId: string) {
  const { data, error } = await supabaseAdmin!
    .from('products')
    .select('category, current_quantity, unit_cost, selling_price')
    .eq('user_id', userId)

  if (error) return []

  const byCategory: Record<string, { count: number; value: number; revenue: number }> = {}

  for (const product of data) {
    const category = product.category || 'Uncategorized'
    if (!byCategory[category]) {
      byCategory[category] = { count: 0, value: 0, revenue: 0 }
    }
    byCategory[category].count++
    byCategory[category].value += (product.current_quantity || 0) * parseFloat(product.unit_cost || '0')
    byCategory[category].revenue += (product.current_quantity || 0) * parseFloat(product.selling_price || '0')
  }

  return Object.entries(byCategory).map(([category, stats]) => ({
    category,
    ...stats,
    value: Math.round(stats.value * 100) / 100,
    revenue: Math.round(stats.revenue * 100) / 100,
  }))
}

async function getSupplierPerformance(userId: string, startDate: string) {
  const { data, error } = await supabaseAdmin!
    .from('purchase_orders')
    .select('*, items(*)')
    .eq('user_id', userId)
    .gte('created_at', startDate)

  if (error) return []

  const bySupplier: Record<string, { orders: number; total: number; items: number }> = {}

  for (const po of data) {
    const supplierId = po.supplier_id || 'Unknown'
    if (!bySupplier[supplierId]) {
      bySupplier[supplierId] = { orders: 0, total: 0, items: 0 }
    }
    bySupplier[supplierId].orders++
    bySupplier[supplierId].total += parseFloat(po.total_amount || '0')
    if (po.items && Array.isArray(po.items)) {
      bySupplier[supplierId].items += po.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0)
    }
  }

  return Object.entries(bySupplier).map(([supplierId, stats]) => ({
    supplierId,
    ...stats,
    total: Math.round(stats.total * 100) / 100,
  }))
}
