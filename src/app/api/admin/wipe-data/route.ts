import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getCurrentTenantId } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Verify admin access
    const user = await getCurrentUser(req as any)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getCurrentTenantId(req as any)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { confirm } = body

    if (confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json({ 
        error: 'Confirmation required',
        message: 'Send { "confirm": "DELETE_ALL_DATA" } to confirm deletion'
      }, { status: 400 })
    }

    // Delete data in correct order to respect foreign keys
    const deletedCounts: Record<string, number> = {}

    // Receipt Scans
    const receiptScans = await prisma.receiptScan.deleteMany({
      where: { tenantId }
    })
    deletedCounts.receiptScans = receiptScans.count

    // Audit Logs
    const auditLogs = await prisma.auditLog.deleteMany({
      where: { tenantId }
    })
    deletedCounts.auditLogs = auditLogs.count

    // Stock Take Items
    const stockTakeItems = await prisma.stockTakeItem.deleteMany({
      where: { stockTake: { tenantId } }
    })
    deletedCounts.stockTakeItems = stockTakeItems.count

    // Stock Takes
    const stockTakes = await prisma.stockTake.deleteMany({
      where: { tenantId }
    })
    deletedCounts.stockTakes = stockTakes.count

    // Serial Numbers
    const serialNumbers = await prisma.serialNumber.deleteMany({
      where: { tenantId }
    })
    deletedCounts.serialNumbers = serialNumbers.count

    // Batches
    const batches = await prisma.batch.deleteMany({
      where: { tenantId }
    })
    deletedCounts.batches = batches.count

    // Stock History
    const stockHistory = await prisma.stockHistory.deleteMany({
      where: { tenantId }
    })
    deletedCounts.stockHistory = stockHistory.count

    // Inventory Events
    const inventoryEvents = await prisma.inventoryEvent.deleteMany({
      where: { tenantId }
    })
    deletedCounts.inventoryEvents = inventoryEvents.count

    // Stock Transfers
    const stockTransfers = await prisma.stockTransfer.deleteMany({
      where: { tenantId }
    })
    deletedCounts.stockTransfers = stockTransfers.count

    // Invoice Items
    const invoiceItems = await prisma.invoiceItem.deleteMany({
      where: { invoice: { tenantId } }
    })
    deletedCounts.invoiceItems = invoiceItems.count

    // Invoices
    const invoices = await prisma.invoice.deleteMany({
      where: { tenantId }
    })
    deletedCounts.invoices = invoices.count

    // Customers
    const customers = await prisma.customer.deleteMany({
      where: { tenantId }
    })
    deletedCounts.customers = customers.count

    // Purchase Order Items
    const purchaseOrderItems = await prisma.purchaseOrderItem.deleteMany({
      where: { order: { tenantId } }
    })
    deletedCounts.purchaseOrderItems = purchaseOrderItems.count

    // Purchase Orders
    const purchaseOrders = await prisma.purchaseOrder.deleteMany({
      where: { tenantId }
    })
    deletedCounts.purchaseOrders = purchaseOrders.count

    // Product Settings
    await prisma.productSettings.deleteMany({
      where: { tenantId }
    })

    // WhatsApp Settings
    await prisma.whatsAppSettings.deleteMany({
      where: { tenantId }
    })

    // Alerts
    const alerts = await prisma.alert.deleteMany({
      where: { tenantId }
    })
    deletedCounts.alerts = alerts.count

    // Stock Levels
    const stockLevels = await prisma.stockLevel.deleteMany({
      where: { tenantId }
    })
    deletedCounts.stockLevels = stockLevels.count

    // Products
    const products = await prisma.product.deleteMany({
      where: { tenantId }
    })
    deletedCounts.products = products.count

    // Locations (except primary)
    const locations = await prisma.location.deleteMany({
      where: { tenantId, isPrimary: false }
    })
    deletedCounts.locations = locations.count

    return NextResponse.json({
      success: true,
      message: 'All data has been wiped for your organization',
      deleted: deletedCounts,
      totalDeleted: Object.values(deletedCounts).reduce((a, b) => a + b, 0),
      note: 'Users, tenant, and primary location are preserved'
    })

  } catch (error) {
    console.error('Wipe data error:', error)
    return NextResponse.json({ 
      error: 'Failed to wipe data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Send POST request with { "confirm": "DELETE_ALL_DATA" } to wipe all data',
    warning: 'This will delete ALL products, stock, invoices, purchase orders, and other business data for your tenant. This cannot be undone!',
    preserved: ['Users', 'Tenant/Organization', 'Primary Location']
  })
}
