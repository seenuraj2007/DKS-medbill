import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// POST /api/purchase-orders/[id]/items/[itemId]/receive - Receive items with serial numbers
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { quantity, serial_numbers } = body

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    // Get the purchase order item
    const orderItem = await prisma.purchaseOrderItem.findFirst({
      where: {
        id: params.itemId,
        orderId: params.id,
      },
      include: {
        order: true,
        product: true,
      },
    })

    if (!orderItem) {
      return NextResponse.json(
        { error: 'Order item not found' },
        { status: 404 }
      )
    }

    // Verify order belongs to tenant
    if (orderItem.order.tenantId !== user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if order is in valid status
    if (orderItem.order.status === 'CANCELLED' || orderItem.order.status === 'RECEIVED') {
      return NextResponse.json(
        { error: 'Cannot receive items for this order' },
        { status: 400 }
      )
    }

    // Check if quantity exceeds remaining
    const remainingQty = orderItem.quantity - orderItem.receivedQty
    if (quantity > remainingQty) {
      return NextResponse.json(
        { error: `Cannot receive more than ${remainingQty} items` },
        { status: 400 }
      )
    }

    // Validate serial numbers if provided
    if (serial_numbers && Array.isArray(serial_numbers)) {
      if (serial_numbers.length !== quantity) {
        return NextResponse.json(
          { error: 'Number of serial numbers must match quantity' },
          { status: 400 }
        )
      }

      // Check for duplicate serial numbers
      const existingSerials = await (prisma as any).serialNumber.findMany({
        where: {
          tenantId: user.tenantId,
          productId: orderItem.productId,
          serialNumber: { in: serial_numbers },
        },
        select: { serialNumber: true },
      })

      if (existingSerials.length > 0) {
        return NextResponse.json(
          {
            error: 'Some serial numbers already exist',
            duplicates: existingSerials.map((s: any) => s.serialNumber),
          },
          { status: 409 }
        )
      }
    }

    // Get or create stock level for the product
    const primaryLocation = await prisma.location.findFirst({
      where: {
        tenantId: user.tenantId,
        isPrimary: true,
      },
    })

    if (!primaryLocation) {
      return NextResponse.json(
        { error: 'No primary location found' },
        { status: 400 }
      )
    }

    let stockLevel = await prisma.stockLevel.findFirst({
      where: {
        tenantId: user.tenantId,
        productId: orderItem.productId,
        locationId: primaryLocation.id,
      },
    })

    if (!stockLevel) {
      stockLevel = await prisma.stockLevel.create({
        data: {
          tenantId: user.tenantId,
          productId: orderItem.productId,
          locationId: primaryLocation.id,
          quantity: 0,
          reorderPoint: 0,
        },
      })
    }

    // Create serial numbers if provided
    if (serial_numbers && serial_numbers.length > 0) {
      const warrantyMonths = 12 // Default warranty
      const warrantyExpiry = new Date()
      warrantyExpiry.setMonth(warrantyExpiry.getMonth() + warrantyMonths)

      await (prisma as any).serialNumber.createMany({
        data: serial_numbers.map((serial: string) => ({
          tenantId: user.tenantId,
          productId: orderItem.productId,
          stockLevelId: stockLevel.id,
          serialNumber: serial,
          status: 'IN_STOCK',
          warrantyMonths,
          warrantyExpiry,
          unitCost: orderItem.unitCost.toNumber(),
          createdBy: user.userId,
        })),
      })
    }

    // Update stock level
    await prisma.stockLevel.update({
      where: { id: stockLevel.id },
      data: {
        quantity: { increment: quantity },
      },
    })

    // Update order item received quantity
    const newReceivedQty = orderItem.receivedQty + quantity
    await prisma.purchaseOrderItem.update({
      where: { id: params.itemId },
      data: {
        receivedQty: newReceivedQty,
      },
    })

    // Create inventory event
    await prisma.inventoryEvent.create({
      data: {
        tenantId: user.tenantId,
        type: 'STOCK_RECEIVED',
        productId: orderItem.productId,
        locationId: primaryLocation.id,
        quantityDelta: quantity,
        runningBalance: stockLevel.quantity + quantity,
        referenceType: 'PURCHASE_ORDER',
        referenceId: params.id,
        userId: user.userId,
        notes: serial_numbers
          ? `Received ${quantity} items with serial numbers`
          : `Received ${quantity} items`,
      },
    })

    // Update purchase order status
    const allItems = await prisma.purchaseOrderItem.findMany({
      where: { orderId: params.id },
    })

    const allReceived = allItems.every(
      (item) => item.receivedQty >= item.quantity
    )
    const anyReceived = allItems.some((item) => item.receivedQty > 0)

    let newStatus = orderItem.order.status
    if (allReceived) {
      newStatus = 'RECEIVED'
    } else if (anyReceived) {
      newStatus = 'PARTIAL'
    }

    if (newStatus !== orderItem.order.status) {
      await prisma.purchaseOrder.update({
        where: { id: params.id },
        data: { status: newStatus },
      })
    }

    return NextResponse.json({
      message: `${quantity} item(s) received successfully`,
      received: newReceivedQty,
      total: orderItem.quantity,
    })
  } catch (error) {
    console.error('Receive items error:', error)
    return NextResponse.json(
      { error: 'Failed to receive items' },
      { status: 500 }
    )
  }
}
