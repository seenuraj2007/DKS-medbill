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

    // In the new schema, suppliers are stored as fields on products
    // Find products by supplier email or name
    const products = await prisma.product.findMany({
      where: {
        tenantId: user.tenantId,
        OR: [
          { supplierEmail: id },
          { supplierName: id }
        ]
      },
      include: {
        stockLevels: true
      },
      orderBy: { name: 'asc' }
    })

    if (products.length === 0) {
      return NextResponse.json({ error: 'Supplier not found or no products found' }, { status: 404 })
    }

    // Transform products with stock levels and converted Decimals
    const transformedProducts = products.map((product: any) => {
      const totalQuantity = product.stockLevels?.reduce((sum: number, sl: any) => sum + sl.quantity, 0) || 0
      const reorderPoint = product.stockLevels?.[0]?.reorderPoint || 0

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        current_quantity: totalQuantity,
        reorder_point: reorderPoint,
        unit_cost: product.unitCost ? Number(product.unitCost) : 0,
        selling_price: product.sellingPrice ? Number(product.sellingPrice) : 0,
        unit: product.unit,
        image_url: product.imageUrl,
        supplier_name: product.supplierName,
        supplier_email: product.supplierEmail,
        supplier_phone: product.supplierPhone,
        is_active: product.isActive,
        created_at: product.createdAt.toISOString()
      }
    })

    return NextResponse.json({ products: transformedProducts })
  } catch (error) {
    console.error('Get supplier products error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
