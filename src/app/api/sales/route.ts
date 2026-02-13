import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get sales from inventory events (type = STOCK_SOLD)
    const sales = await prisma.inventoryEvent.findMany({
      where: { 
        tenantId: user.tenantId,
        type: 'STOCK_SOLD'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ sales })
  } catch (error) {
    console.error('Get sales error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { customerId, items, paymentMethod, paymentStatus, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 })
    }

    const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    let total = 0

    // Process all items in a transaction to ensure atomicity
    await prisma.$transaction(async (tx: any) => {
      for (const item of items) {
        // Support both snake_case (from billing page) and camelCase property names
        const productId = item.productId || item.product_id
        const quantity = item.quantity
        const unitPrice = item.unitPrice || item.unit_price
        const discount = item.discount || 0
        
        if (!productId || !quantity) {
          throw new Error(`Invalid sale item: ${JSON.stringify(item)}`)
        }
        
        // Verify product exists and has enough stock
        const product = await tx.product.findFirst({
          where: { 
            id: productId,
            tenantId: user.tenantId
          }
        })
        
        if (!product) {
          throw new Error(`Product not found: ${productId}`)
        }
        
        // Get current stock
        const stockLevels = await tx.stockLevel.findMany({
          where: { 
            productId,
            tenantId: user.tenantId
          }
        })
        
        const currentStock = stockLevels.reduce((sum: number, sl: any) => sum + sl.quantity, 0)
        
        if (currentStock < quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${currentStock}, Requested: ${quantity}`)
        }
        
        const itemTotal = (unitPrice * quantity) - discount
        total += itemTotal

        // Create inventory event for the sale
        await tx.inventoryEvent.create({
          data: {
            tenantId: user.tenantId,
            type: 'STOCK_SOLD',
            productId,
            quantityDelta: -quantity,
            runningBalance: currentStock - quantity,
            referenceType: 'SALE',
            referenceId: saleNumber,
            userId: user.userId,
            notes: notes || `Sale: ${saleNumber}`,
            metadata: {
              paymentMethod,
              paymentStatus,
              customerId,
              unitPrice,
              discount
            }
          }
        })

        // Update stock levels
        if (stockLevels.length > 0) {
          const primaryLocation = stockLevels.find((sl: any) => sl.quantity > 0) || stockLevels[0]
          if (primaryLocation) {
            await tx.stockLevel.update({
              where: { id: primaryLocation.id },
              data: {
                quantity: { decrement: quantity }
              }
            })
          }
        }
      }
    })

    return NextResponse.json({ 
      sale: {
        id: saleNumber,
        sale_number: saleNumber,
        total
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Create sale error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
