import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = parseInt(searchParams.get('period') || '30')

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Get user's tenant
    const member = await prisma.member.findFirst({
      where: { userId: user.id }
    })

    if (!member) {
      return NextResponse.json({
        sales: { total: 0, count: 0, average: 0, byStatus: {} },
        products: { total: 0, totalValue: 0, categories: 0, withImages: 0 },
        stock: { total: 0, lowStock: 0, outOfStock: 0, value: 0, potentialRevenue: 0 },
        alerts: { total: 0, byType: {}, unread: 0 },
        revenueByDay: [],
        topProducts: [],
        categoryBreakdown: [],
        supplierPerformance: [],
      })
    }

    const tenantId = member.tenantId

    // Fetch all required data in parallel for better performance
    const [products, stockLevels, alerts, revenueEvents, purchaseOrders] = await Promise.all([
      prisma.product.findMany({ where: { tenantId } }),
      prisma.stockLevel.findMany({ where: { product: { tenantId } }, include: { product: true } }),
      prisma.alert.findMany({ where: { tenantId } }),
      prisma.inventoryEvent.findMany({
        where: { tenantId, type: 'STOCK_SOLD', createdAt: { gte: startDate } }
      }),
      prisma.purchaseOrder.findMany({ where: { tenantId, createdAt: { gte: startDate } } })
    ])

    // Calculate analytics
    const totalProducts = products.length
    const totalValue = products.reduce((sum: number, p: any) => {
      const cost = parseFloat(p.unitCost.toString())
      const stockLevel = stockLevels.find((sl: any) => sl.productId === p.id)
      const quantity = stockLevel?.quantity || 0
      return sum + (cost * quantity)
    }, 0)

    const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))].length
    const withImages = products.filter((p: any) => p.imageUrl).length

    // Stock analytics
    const lowStock = stockLevels.filter((sl: any) => sl.quantity <= sl.reorderPoint && sl.quantity > 0).length
    const outOfStock = stockLevels.filter((sl: any) => sl.quantity === 0).length

    const stockValue = stockLevels.reduce((sum: number, sl: any) => {
      const cost = parseFloat(sl.product.unitCost.toString())
      return sum + (sl.quantity * cost)
    }, 0)

    const potentialRevenue = stockLevels.reduce((sum: number, sl: any) => {
      const price = parseFloat(sl.product.sellingPrice.toString())
      return sum + (sl.quantity * price)
    }, 0)

    // Alerts analytics
    const byType = alerts.reduce((acc: Record<string, number>, alert: any) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      return acc
    }, {})

    const unreadAlerts = alerts.filter((a: any) => !a.isRead).length

    // Revenue by day (from inventory events)
    const byDay = revenueEvents.reduce((acc: Record<string, number>, event: any) => {
      const date = event.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + (event.quantityDelta > 0 ? -event.quantityDelta : event.quantityDelta)
      return acc
    }, {})

    const revenueByDay = Object.entries(byDay).map(([date, amount]) => ({
      date,
      revenue: Math.round(Math.abs(amount as number) * 100) / 100
    }))

    // Top products by stock value
    const topProducts = stockLevels
      .map((sl: any) => ({
        id: sl.product.id,
        name: sl.product.name,
        quantity: sl.quantity,
        value: sl.quantity * parseFloat(sl.product.unitCost.toString())
      }))
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 10)

    // Category breakdown
    const categoryMap = products.reduce((acc: Record<string, { count: number; value: number; revenue: number }>, product: any) => {
      const category = product.category || 'Uncategorized'
      const stockLevel = stockLevels.find((sl: any) => sl.productId === product.id)
      const quantity = stockLevel?.quantity || 0
      const cost = parseFloat(product.unitCost.toString())
      const price = parseFloat(product.sellingPrice.toString())

      if (!acc[category]) {
        acc[category] = { count: 0, value: 0, revenue: 0 }
      }
      acc[category].count++
      acc[category].value += quantity * cost
      acc[category].revenue += quantity * price
      return acc
    }, {})

    const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      count: (stats as any).count,
      value: Math.round((stats as any).value * 100) / 100,
      revenue: Math.round((stats as any).revenue * 100) / 100
    }))

    // Supplier performance (from purchase orders)
    const supplierMap = purchaseOrders.reduce((acc: Record<string, { orders: number; total: number; items: number }>, po: any) => {
      const supplier = po.supplierName || 'Unknown'
      if (!acc[supplier]) {
        acc[supplier] = { orders: 0, total: 0, items: 0 }
      }
      acc[supplier].orders++
      acc[supplier].total += parseFloat(po.totalAmount.toString())
      return acc
    }, {})

    const supplierPerformance = Object.entries(supplierMap).map(([supplierName, stats]) => ({
      supplierId: supplierName,
      supplierName,
      orders: (stats as any).orders,
      items: (stats as any).items,
      total: Math.round((stats as any).total * 100) / 100
    }))

    // Sales from inventory events
    const salesEvents = revenueEvents
    const totalSales = salesEvents.length
    const salesTotal = salesEvents.reduce((sum: number, e: any) => {
      const meta = e.metadata as Record<string, any> | null
      return sum + Math.abs(parseFloat(meta?.amount?.toString() || '0'))
    }, 0)

    return NextResponse.json({
      sales: {
        total: Math.round(salesTotal * 100) / 100,
        count: totalSales,
        average: totalSales > 0 ? Math.round((salesTotal / totalSales) * 100) / 100 : 0,
        byStatus: { COMPLETED: totalSales, PENDING: 0 }
      },
      products: {
        total: totalProducts,
        totalValue: Math.round(totalValue * 100) / 100,
        categories,
        withImages
      },
      stock: {
        total: stockLevels.reduce((sum: number, sl: any) => sum + sl.quantity, 0),
        lowStock,
        outOfStock,
        value: Math.round(stockValue * 100) / 100,
        potentialRevenue: Math.round(potentialRevenue * 100) / 100
      },
      alerts: {
        total: alerts.length,
        byType,
        unread: unreadAlerts
      },
      revenueByDay,
      topProducts,
      categoryBreakdown,
      supplierPerformance,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
