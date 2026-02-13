import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest, requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        tenantId: user.tenantId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ purchaseOrders: purchaseOrders || [] })
  } catch (error) {
    console.error('Purchase orders API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { supplierName, supplierEmail, supplierPhone, items, notes } = body

    if (!supplierName || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitCost), 0)

    // Create purchase order with items
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        tenantId: user.tenantId,
        orderNumber: orderNumber,
        supplierName: supplierName,
        supplierEmail: supplierEmail,
        supplierPhone: supplierPhone,
        totalAmount: totalAmount,
        notes: notes,
        orderedBy: user.userId,
        orderedAt: new Date(),
        status: 'ORDERED',
        items: {
          create: items.map((item: any) => ({
            tenantId: user.tenantId,
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
            receivedQty: 0
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({ purchaseOrder: purchaseOrder }, { status: 201 })
  } catch (error) {
    console.error('Purchase order POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
