import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

// GET - List all stock transfers with enhanced filtering
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const fromLocationId = searchParams.get('fromLocationId')
    const toLocationId = searchParams.get('toLocationId')
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = { tenantId: user.tenantId }
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }
    if (fromLocationId) {
      where.fromLocationId = fromLocationId
    }
    if (toLocationId) {
      where.toLocationId = toLocationId
    }
    if (productId) {
      where.productId = productId
    }

    const [transfers, total] = await Promise.all([
      prisma.stockTransfer.findMany({
        where,
        include: {
          fromLocation: {
            select: { id: true, name: true }
          },
          toLocation: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.stockTransfer.count({ where })
    ])

    return NextResponse.json({
      transfers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get stock transfers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new stock transfer with validation
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { fromLocationId, toLocationId, productId, quantity, notes } = body

    // Validation
    if (!fromLocationId || !toLocationId || !productId || !quantity) {
      return NextResponse.json({ 
        error: 'Missing required fields: fromLocationId, toLocationId, productId, quantity' 
      }, { status: 400 })
    }

    if (fromLocationId === toLocationId) {
      return NextResponse.json({ 
        error: 'Source and destination locations cannot be the same' 
      }, { status: 400 })
    }

    const qty = Number(quantity)
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ 
        error: 'Quantity must be a positive number' 
      }, { status: 400 })
    }

    // Verify locations exist and belong to tenant
    const [fromLocation, toLocation, product] = await Promise.all([
      prisma.location.findFirst({
        where: { id: fromLocationId, tenantId: user.tenantId }
      }),
      prisma.location.findFirst({
        where: { id: toLocationId, tenantId: user.tenantId }
      }),
      prisma.product.findFirst({
        where: { id: productId, tenantId: user.tenantId }
      })
    ])

    if (!fromLocation) {
      return NextResponse.json({ error: 'Source location not found' }, { status: 404 })
    }
    if (!toLocation) {
      return NextResponse.json({ error: 'Destination location not found' }, { status: 404 })
    }
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check stock availability at source location
    const sourceStock = await prisma.stockLevel.findUnique({
      where: {
        tenantId_productId_locationId: {
          tenantId: user.tenantId,
          productId: productId,
          locationId: fromLocationId
        }
      }
    })

    if (!sourceStock || sourceStock.quantity < qty) {
      return NextResponse.json({ 
        error: `Insufficient stock at source location. Available: ${sourceStock?.quantity || 0}, Requested: ${qty}` 
      }, { status: 400 })
    }

    // Create transfer
    const transfer = await prisma.stockTransfer.create({
      data: {
        tenantId: user.tenantId,
        fromLocationId,
        toLocationId,
        productId,
        quantity: qty,
        requestedBy: user.id,
        notes: notes || null,
        status: 'PENDING'
      },
      include: {
        fromLocation: { select: { id: true, name: true } },
        toLocation: { select: { id: true, name: true } }
      }
    })

    return NextResponse.json({ 
      transfer,
      message: 'Stock transfer created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create stock transfer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
