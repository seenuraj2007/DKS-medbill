import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: productId } = await params

    const product = await prisma.product.findUnique({
      where: { id: productId, tenantId: user.tenantId },
      include: {
        stockLevels: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Aggregate stock levels data
    const totalQuantity = product.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0)
    const reorderPoint = product.stockLevels[0]?.reorderPoint || 0

    // Transform to match frontend expectations
    const transformedProduct = {
      ...product,
      current_quantity: totalQuantity,
      reorder_point: reorderPoint,
      unit_cost: product.unitCost ? Number(product.unitCost) : 0,
      selling_price: product.sellingPrice ? Number(product.sellingPrice) : 0,
      supplier_name: product.supplierName,
      supplier_email: product.supplierEmail,
      supplier_phone: product.supplierPhone,
      image_url: product.imageUrl,
      stockLevels: undefined
    }

    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id: productId } = await params

    // Extract stock-related fields
    const { 
      current_quantity, 
      reorder_point, 
      ...productData 
    } = body

    // Map snake_case to camelCase for product fields
    const prismaProductData: any = {}
    
    if (productData.name !== undefined) prismaProductData.name = productData.name
    if (productData.sku !== undefined) prismaProductData.sku = productData.sku || null
    if (productData.barcode !== undefined) prismaProductData.barcode = productData.barcode || null
    if (productData.category !== undefined) prismaProductData.category = productData.category || null
    if (productData.unit !== undefined) prismaProductData.unit = productData.unit || 'unit'
    if (productData.description !== undefined) prismaProductData.description = productData.description || null
    if (productData.unit_cost !== undefined) prismaProductData.unitCost = productData.unit_cost || 0
    if (productData.selling_price !== undefined) prismaProductData.sellingPrice = productData.selling_price || 0
    if (productData.image_url !== undefined) prismaProductData.imageUrl = productData.image_url || null
    if (productData.supplier_name !== undefined) prismaProductData.supplierName = productData.supplier_name || null
    if (productData.supplier_email !== undefined) prismaProductData.supplierEmail = productData.supplier_email || null
    if (productData.supplier_phone !== undefined) prismaProductData.supplierPhone = productData.supplier_phone || null

    // Update product
    const product = await prisma.product.update({
      where: { id: productId, tenantId: user.tenantId },
      data: prismaProductData
    })

    // Handle stock level updates if quantity or reorder point provided
    if ((current_quantity !== undefined || reorder_point !== undefined) && user.tenantId) {
      // Get primary location or first available location
      const location = await prisma.location.findFirst({
        where: { 
          tenantId: user.tenantId,
          isActive: true,
          deletedAt: null
        },
        orderBy: { isPrimary: 'desc' }
      })

      if (location) {
        const existingStockLevel = await prisma.stockLevel.findUnique({
          where: {
            tenantId_productId_locationId: {
              tenantId: user.tenantId,
              productId: productId,
              locationId: location.id
            }
          }
        })

        if (existingStockLevel) {
          // Update existing stock level
          await prisma.stockLevel.update({
            where: { id: existingStockLevel.id },
            data: {
              ...(current_quantity !== undefined && { quantity: parseInt(current_quantity) || 0 }),
              ...(reorder_point !== undefined && { reorderPoint: parseInt(reorder_point) || 0 })
            }
          })
        } else if (current_quantity !== undefined) {
          // Create new stock level only if quantity is provided
          await prisma.stockLevel.create({
            data: {
              tenantId: user.tenantId,
              productId: productId,
              locationId: location.id,
              quantity: parseInt(current_quantity) || 0,
              reorderPoint: parseInt(reorder_point) || 0,
              reservedQuantity: 0,
              version: 0
            }
          })
        }
      }
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: productId } = await params

    await prisma.product.update({
      where: { id: productId, tenantId: user.tenantId },
      data: { deletedAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
