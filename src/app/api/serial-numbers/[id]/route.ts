import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/serial-numbers/[id] - Get a single serial number
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serialNumber = await (prisma as any).serialNumber.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            imageUrl: true,
            sellingPrice: true,
          },
        },
        batch: {
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
          },
        },
        stockLevel: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!serialNumber) {
      return NextResponse.json(
        { error: 'Serial number not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ serialNumber })
  } catch (error) {
    console.error('Get serial number error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch serial number' },
      { status: 500 }
    )
  }
}

// PUT /api/serial-numbers/[id] - Update a serial number
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      serialNumber,
      alternateSerial,
      status,
      warrantyMonths,
      unitCost,
      notes,
      batchId,
      stockLevelId,
    } = body

    // Verify serial number exists
    const existing = await (prisma as any).serialNumber.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Serial number not found' },
        { status: 404 }
      )
    }

    // Check for duplicate if serial number is being changed
    if (serialNumber && serialNumber !== existing.serialNumber) {
      const duplicate = await (prisma as any).serialNumber.findFirst({
        where: {
          tenantId: user.tenantId,
          productId: existing.productId,
          serialNumber,
          id: { not: params.id },
        },
      })

      if (duplicate) {
        return NextResponse.json(
          { error: 'Serial number already exists for this product' },
          { status: 409 }
        )
      }
    }

    // Calculate warranty expiry
    let warrantyExpiry = existing.warrantyExpiry
    if (warrantyMonths !== undefined && warrantyMonths !== existing.warrantyMonths) {
      warrantyExpiry = warrantyMonths
        ? new Date(Date.now() + warrantyMonths * 30 * 24 * 60 * 60 * 1000)
        : null
    }

    // Update serial number
    const updated = await (prisma as any).serialNumber.update({
      where: { id: params.id },
      data: {
        serialNumber: serialNumber || undefined,
        alternateSerial: alternateSerial !== undefined ? alternateSerial : undefined,
        status: status || undefined,
        warrantyMonths: warrantyMonths !== undefined ? warrantyMonths : undefined,
        warrantyExpiry,
        unitCost: unitCost !== undefined ? parseFloat(unitCost) : undefined,
        notes: notes !== undefined ? notes : undefined,
        batchId: batchId !== undefined ? batchId : undefined,
        stockLevelId: stockLevelId !== undefined ? stockLevelId : undefined,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
      },
    })

    return NextResponse.json({ serialNumber: updated })
  } catch (error) {
    console.error('Update serial number error:', error)
    return NextResponse.json(
      { error: 'Failed to update serial number' },
      { status: 500 }
    )
  }
}

// DELETE /api/serial-numbers/[id] - Delete a serial number
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Verify serial number exists
    const existing = await (prisma as any).serialNumber.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Serial number not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of sold serial numbers
    if (existing.status === 'SOLD') {
      return NextResponse.json(
        { error: 'Cannot delete a sold serial number' },
        { status: 400 }
      )
    }

    // Delete serial number
    await (prisma as any).serialNumber.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: 'Serial number deleted successfully',
    })
  } catch (error) {
    console.error('Delete serial number error:', error)
    return NextResponse.json(
      { error: 'Failed to delete serial number' },
      { status: 500 }
    )
  }
}
