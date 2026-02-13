import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const location = await prisma.location.findFirst({
      where: { id, tenantId: user.tenantId }
    })

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const stockLevels = await prisma.stockLevel.findMany({
      where: { locationId: id },
      include: {
        product: true
      }
    })

    const formattedProducts = stockLevels.map((sl: any) => ({
      id: sl.product.id,
      name: sl.product.name,
      sku: sl.product.sku,
      barcode: sl.product.barcode,
      category: sl.product.category,
      unit: sl.product.unit,
      image_url: sl.product.imageUrl,
      unit_cost: sl.product.unitCost ? Number(sl.product.unitCost) : 0,
      selling_price: sl.product.sellingPrice ? Number(sl.product.sellingPrice) : 0,
      location_quantity: sl.quantity,
      reorder_point: sl.reorderPoint || 0
    }))

    return NextResponse.json({ products: formattedProducts })
  } catch (error) {
    console.error('Get location products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
