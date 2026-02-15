import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/purchase-orders/[id] - Get purchase order with items
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await prisma.purchaseOrder.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }

    // Check if any items have serial numbers
    const orderWithSerialInfo = {
      ...order,
      items: await Promise.all(
        order.items.map(async (item) => {
          const serialCount = await (prisma as any).serialNumber.count({
            where: {
              tenantId: user.tenantId,
              productId: item.productId,
            },
          })
          return {
            ...item,
            product_name: item.product.name,
            product_sku: item.product.sku,
            has_serial_numbers: serialCount > 0,
          }
        })
      ),
    }

    return NextResponse.json({ order: orderWithSerialInfo })
  } catch (error) {
    console.error('Get purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase order' },
      { status: 500 }
    )
  }
}

// PATCH /api/purchase-orders/[id] - Update purchase order
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const order = await prisma.purchaseOrder.update({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      data: body,
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Update purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase order' },
      { status: 500 }
    )
  }
}

// DELETE /api/purchase-orders/[id] - Delete purchase order
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.purchaseOrder.delete({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to delete purchase order' },
      { status: 500 }
    )
  }
}
