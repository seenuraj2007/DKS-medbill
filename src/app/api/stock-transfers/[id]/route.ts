import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single stock transfer with details
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transfer = await prisma.stockTransfer.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        fromLocation: true,
        toLocation: true
      }
    })

    if (!transfer) {
      return NextResponse.json({ error: 'Stock transfer not found' }, { status: 404 })
    }

    // Fetch product details separately
    const product = await prisma.product.findFirst({
      where: { id: transfer.productId, tenantId: user.tenantId },
      select: { id: true, name: true, sku: true, imageUrl: true }
    })

    return NextResponse.json({ 
      transfer: { 
        ...transfer, 
        from_location_name: transfer.fromLocation?.name,
        to_location_name: transfer.toLocation?.name,
        product
      } 
    })
  } catch (error) {
    console.error('Get stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update stock transfer status and handle stock movement
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    const validStatuses = ['PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const transfer = await prisma.stockTransfer.findFirst({
      where: { id, tenantId: user.tenantId }
    })

    if (!transfer) {
      return NextResponse.json({ error: 'Stock transfer not found' }, { status: 404 })
    }

    const newStatus = status.toUpperCase() as 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['IN_TRANSIT', 'CANCELLED'],
      'IN_TRANSIT': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': []
    }

    if (!validTransitions[transfer.status].includes(newStatus)) {
      return NextResponse.json({ 
        error: `Cannot transition from ${transfer.status} to ${newStatus}` 
      }, { status: 400 })
    }

    // Handle stock movement when completing transfer
    if (newStatus === 'COMPLETED') {
      await prisma.$transaction(async (tx) => {
        // Get or create stock levels for both locations
        const [sourceStock, destStock] = await Promise.all([
          tx.stockLevel.findUnique({
            where: {
              tenantId_productId_locationId: {
                tenantId: user.tenantId!,
                productId: transfer.productId,
                locationId: transfer.fromLocationId
              }
            }
          }),
          tx.stockLevel.findUnique({
            where: {
              tenantId_productId_locationId: {
                tenantId: user.tenantId!,
                productId: transfer.productId,
                locationId: transfer.toLocationId
              }
            }
          })
        ])

        // Validate source stock
        if (!sourceStock || sourceStock.quantity < transfer.quantity) {
          throw new Error(`Insufficient stock at source location. Available: ${sourceStock?.quantity || 0}`)
        }

        // Decrease stock at source
        await tx.stockLevel.update({
          where: {
            tenantId_productId_locationId: {
              tenantId: user.tenantId!,
              productId: transfer.productId,
              locationId: transfer.fromLocationId
            }
          },
          data: {
            quantity: { decrement: transfer.quantity },
            updatedAt: new Date()
          }
        })

        // Increase stock at destination (create if doesn't exist)
        if (destStock) {
          await tx.stockLevel.update({
            where: {
              tenantId_productId_locationId: {
                tenantId: user.tenantId!,
                productId: transfer.productId,
                locationId: transfer.toLocationId
              }
            },
            data: {
              quantity: { increment: transfer.quantity },
              updatedAt: new Date()
            }
          })
        } else {
          await tx.stockLevel.create({
            data: {
              tenantId: user.tenantId!,
              productId: transfer.productId,
              locationId: transfer.toLocationId,
              quantity: transfer.quantity,
              reorderPoint: 0
            }
          })
        }

        // Create inventory events
        await Promise.all([
          tx.inventoryEvent.create({
            data: {
              tenantId: user.tenantId!,
              productId: transfer.productId,
              locationId: transfer.fromLocationId,
              type: 'TRANSFER_OUT',
              quantityDelta: -transfer.quantity,
              runningBalance: sourceStock.quantity - transfer.quantity,
              referenceId: transfer.id,
              referenceType: 'TRANSFER',
              notes: `Transfer to location ${transfer.toLocationId}`,
              userId: user.id
            }
          }),
          tx.inventoryEvent.create({
            data: {
              tenantId: user.tenantId!,
              productId: transfer.productId,
              locationId: transfer.toLocationId,
              type: 'TRANSFER_IN',
              quantityDelta: transfer.quantity,
              runningBalance: (destStock?.quantity || 0) + transfer.quantity,
              referenceId: transfer.id,
              referenceType: 'TRANSFER',
              notes: `Transfer from location ${transfer.fromLocationId}`,
              userId: user.id
            }
          })
        ])

        // Update transfer status
        await tx.stockTransfer.update({
          where: { id },
          data: {
            status: newStatus,
            completedBy: user.id,
            completedAt: new Date()
          }
        })
      })
    } else {
      // Just update status for non-complete transitions
      await prisma.stockTransfer.update({
        where: { id },
        data: { status: newStatus }
      })
    }

    const updatedTransfer = await prisma.stockTransfer.findFirst({
      where: { id },
      include: {
        fromLocation: true,
        toLocation: true
      }
    })

    return NextResponse.json({ 
      transfer: updatedTransfer,
      message: `Transfer ${newStatus.toLowerCase()} successfully`
    })
  } catch (error) {
    console.error('Update stock transfer error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE - Delete stock transfer
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transfer = await prisma.stockTransfer.findFirst({
      where: { id, tenantId: user.tenantId }
    })

    if (!transfer) {
      return NextResponse.json({ error: 'Stock transfer not found' }, { status: 404 })
    }

    if (transfer.status === 'COMPLETED') {
      return NextResponse.json({ 
        error: 'Cannot delete completed transfer. Stock has already been moved.' 
      }, { status: 400 })
    }

    await prisma.stockTransfer.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Transfer deleted successfully'
    })
  } catch (error) {
    console.error('Delete stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
