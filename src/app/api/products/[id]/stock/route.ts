import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)

    const productId = req.url.split('/').slice(-2, -1)[0]

    const stockLevels = await prisma.stockLevel.findMany({
      where: { productId, tenantId: user.tenantId }
    })

    return NextResponse.json({ stockLevels })
  } catch (error) {
    console.error('Get stock error:', error)
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)

    const body = await req.json()
    const productId = req.url.split('/').slice(-2, -1)[0]

    // Get or create default location
    let locationId = body.locationId
    if (!locationId) {
      const location = await prisma.location.findFirst({
        where: { tenantId: user.tenantId, isPrimary: true }
      })
      if (!location) {
        const newLocation = await prisma.location.create({
          data: {
            tenantId: user.tenantId,
            name: 'Main Warehouse',
            isPrimary: true,
            isActive: true
          }
        })
        locationId = newLocation.id
      } else {
        locationId = location.id
      }
    }

    // Handle quantity change
    const quantityChange = parseInt(body.quantity_change) || 0
    const changeType = body.change_type || 'add'

    // Get current stock level
    const existingStock = await prisma.stockLevel.findUnique({
      where: {
        tenantId_productId_locationId: {
          tenantId: user.tenantId,
          productId,
          locationId
        }
      }
    })

    let newQuantity = quantityChange
    if (changeType === 'add' && existingStock) {
      newQuantity = existingStock.quantity + quantityChange
    } else if (changeType === 'remove' && existingStock) {
      newQuantity = Math.max(0, existingStock.quantity - quantityChange)
    }

    const stockLevel = await prisma.stockLevel.upsert({
      where: {
        tenantId_productId_locationId: {
          tenantId: user.tenantId,
          productId,
          locationId
        }
      },
      create: {
        tenantId: user.tenantId,
        productId,
        locationId,
        quantity: newQuantity
      },
      update: {
        quantity: newQuantity
      }
    })

    return NextResponse.json({ stockLevel }, { status: 201 })
  } catch (error) {
    console.error('Update stock error:', error)
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
