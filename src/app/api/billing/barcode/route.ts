import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { barcode } = body

    if (!barcode) {
      return NextResponse.json({ error: 'Barcode is required' }, { status: 400 })
    }

    // Find product by barcode or SKU
    const product = await prisma.product.findFirst({
      where: {
        tenantId: user.tenantId,
        OR: [
          { barcode },
          { sku: barcode }
        ],
        isActive: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get stock levels for this product
    const stockLevels = await prisma.stockLevel.findMany({
      where: { productId: product.id },
      include: { location: true }
    })

    // Calculate total quantity
    const current_quantity = stockLevels.reduce((sum: number, sl: any) => sum + sl.quantity, 0)

    const productResponse = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      current_quantity,
      selling_price: product.sellingPrice ? Number(product.sellingPrice) : 0,
      unit_cost: product.unitCost ? Number(product.unitCost) : 0,
      unit: product.unit,
      image_url: product.imageUrl,
      reorder_point: stockLevels[0]?.reorderPoint || 0,
      stock_levels: stockLevels
    }

    return NextResponse.json({ product: productResponse })
  } catch (error) {
    console.error('Barcode lookup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
