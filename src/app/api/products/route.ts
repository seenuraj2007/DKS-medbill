import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription, hasReachedLimit } from '@/lib/subscription'
import { ProductRepository } from '@/lib/repositories'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('auth_token')?.value
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromRequest(req)

    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const supplier_id = searchParams.get('supplier_id')

    const repo = new ProductRepository(user.tenantId, user.id)

    const filters: any = {}
    if (category) {
      filters.category = category
    }
    if (supplier_id) {
      filters.search = supplier_id
    }

    const products = await repo.findAll(filters)

    const stockLevels = await prisma.stockLevel.findMany({
      where: {
        tenantId: user.tenantId!,
        productId: { in: products.map((p: any) => p.id) }
      }
    })

    const stockByProductId = stockLevels.reduce((acc: any, sl: any) => {
      if (!acc[sl.productId]) {
        acc[sl.productId] = { quantity: 0, reorderPoint: sl.reorderPoint }
      }
      acc[sl.productId].quantity += sl.quantity
      // Use the highest reorder point if multiple locations have different values
      acc[sl.productId].reorderPoint = Math.max(acc[sl.productId].reorderPoint, sl.reorderPoint)
      return acc
    }, {} as Record<string, { quantity: number; reorderPoint: number }>)

    const productsWithAlerts = products.map((product: any) => {
      const stockInfo = stockByProductId[product.id] || { quantity: 0, reorderPoint: 0 }
      const currentQuantity = stockInfo.quantity
      const reorderPoint = stockInfo.reorderPoint
      const isOutOfStock = currentQuantity === 0
      const needsRestock = !isOutOfStock && currentQuantity <= reorderPoint && reorderPoint > 0
      
      return {
        id: product.id,
        tenant_id: product.tenantId,
        user_id: user.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        current_quantity: currentQuantity,
        reorder_point: reorderPoint,
        supplier_id: null,
        supplier_name: product.supplierName,
        supplier_email: product.supplierEmail,
        supplier_phone: product.supplierPhone,
        unit_cost: product.unitCost ? Number(product.unitCost) : 0,
        selling_price: product.sellingPrice ? Number(product.sellingPrice) : 0,
        unit: product.unit,
        image_url: product.imageUrl,
        is_active: product.isActive,
        is_perishable: product.isPerishable ?? true,
        expiry_date: product.expiryDate,
        weight_per_unit: product.weightPerUnit ? Number(product.weightPerUnit) : 1,
        min_weight: product.minWeight ? Number(product.minWeight) : null,
        // Medical-specific fields
        max_retail_price: product.maxRetailPrice ? Number(product.maxRetailPrice) : null,
        composition: product.composition,
        manufacturer: product.manufacturer,
        drug_schedule: product.drugSchedule,
        storage_temp: product.storageTemp,
        requires_prescription: product.requiresPrescription,
        units_per_strip: product.unitsPerStrip,
        strips_per_box: product.stripsPerBox,
        hsn_code: product.hsnCode,
        gst_rate: product.gstRate ? Number(product.gstRate) : 12,
        deleted_at: product.deletedAt,
        created_at: product.createdAt.toISOString(),
        updated_at: product.updatedAt.toISOString(),
        needs_restock: needsRestock,
        is_out_of_stock: isOutOfStock,
        profit_margin: product.sellingPrice > 0
          ? ((Number(product.sellingPrice) - Number(product.unitCost)) / Number(product.sellingPrice) * 100).toFixed(1)
          : '0'
      }
    })

    return NextResponse.json({ products: productsWithAlerts }, {
      headers: {
        'Cache-Control': 'private, max-age=5, stale-while-revalidate=30'
      }
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get('auth_token')?.value
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserFromRequest(req)

    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name, sku, barcode, category, current_quantity, reorder_point,
      supplier_id, supplier_name, supplier_email, supplier_phone,
      unit_cost, selling_price, unit, image_url,
      is_perishable, expiry_date, weight_per_unit, min_weight,
      // Medical-specific fields
      max_retail_price, composition, manufacturer, drug_schedule,
      storage_temp, requires_prescription, units_per_strip, strips_per_box,
      hsn_code, gst_rate
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }

    const subscription = await getOrganizationSubscription(user.tenantId)
    const maxProducts = subscription?.plan?.max_products || 10

    if (subscription && (subscription.status === 'expired' || subscription.status === 'cancelled')) {
      return NextResponse.json({ error: 'Subscription is not active' }, { status: 403 })
    }

    const count = await prisma.product.count({
      where: { tenantId: user.tenantId, isActive: true, deletedAt: null }
    })

    if (maxProducts !== -1 && count >= maxProducts) {
      return NextResponse.json({
        error: 'Product limit reached',
        limit: maxProducts, current: count,
        upgradeUrl: '/subscription'
      }, { status: 403 })
    }

    const repo = new ProductRepository(user.tenantId, user.id)

    let product
    try {
      product = await repo.create({
        name, sku: sku || null, barcode: barcode || null,
        category: category || null, unitCost: unit_cost ?? 0,
        sellingPrice: selling_price ?? 0, unit: unit || 'strip',
        imageUrl: image_url || null,
        supplierName: supplier_name || null,
        supplierEmail: supplier_email || null,
        supplierPhone: supplier_phone || null,
        isPerishable: is_perishable ?? true,
        expiryDate: expiry_date ? new Date(expiry_date) : null,
        weightPerUnit: weight_per_unit ? parseFloat(weight_per_unit) : 1,
        minWeight: min_weight ? parseFloat(min_weight) : null,
        // Medical-specific fields
        maxRetailPrice: max_retail_price ? parseFloat(max_retail_price) : null,
        composition: composition || null,
        manufacturer: manufacturer || null,
        drugSchedule: drug_schedule || 'OTC',
        storageTemp: storage_temp || 'ROOM_TEMP',
        requiresPrescription: requires_prescription ?? false,
        unitsPerStrip: units_per_strip ? parseInt(units_per_strip) : null,
        stripsPerBox: strips_per_box ? parseInt(strips_per_box) : null,
        hsnCode: hsn_code || '3004',
        gstRate: gst_rate ?? 12,
        industryType: 'PHARMA'
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('PRODUCT_CONFLICT')) {
        return NextResponse.json({
          error: 'Product with this SKU or barcode already exists',
          details: error.message
        }, { status: 409 })
      }
      throw error
    }

    if (!product) {
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }

    // Get or create a location for stock levels
    let location = await prisma.location.findFirst({
      where: {
        tenantId: user.tenantId,
        isPrimary: true, isActive: true, deletedAt: null
      }
    })

    if (!location) {
      // Try any active location
      location = await prisma.location.findFirst({
        where: {
          tenantId: user.tenantId,
          isActive: true, deletedAt: null
        }
      })
    }

    if (!location) {
      // Create default location
      location = await prisma.location.create({
        data: {
          tenantId: user.tenantId,
          name: 'Main Warehouse',
          type: 'WAREHOUSE',
          isPrimary: true,
          isActive: true
        }
      })
    }

    // Always create stock level for new products
    await prisma.stockLevel.upsert({
      where: {
        tenantId_productId_locationId: {
          tenantId: user.tenantId,
          productId: product.id,
          locationId: location.id
        }
      },
      create: {
        tenantId: user.tenantId,
        productId: product.id,
        locationId: location.id,
        quantity: current_quantity ?? 0,
        reservedQuantity: 0,
        reorderPoint: reorder_point ?? 0,
        version: 0
      },
      update: { 
        quantity: current_quantity ?? 0,
        reorderPoint: reorder_point ?? 0
      }
    })

    const responseData = {
      id: product.id,
      tenant_id: product.tenantId,
      user_id: user.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      current_quantity: current_quantity ?? 0,
      reorder_point: reorder_point ?? 0,
      supplier_id: null,
      supplier_name: product.supplierName,
      supplier_email: product.supplierEmail,
      supplier_phone: product.supplierPhone,
      unit_cost: product.unitCost ? Number(product.unitCost) : 0,
      selling_price: product.sellingPrice ? Number(product.sellingPrice) : 0,
      unit: product.unit,
      image_url: product.imageUrl,
      is_active: product.isActive,
      deleted_at: product.deletedAt,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
      // Medical-specific fields
      max_retail_price: product.maxRetailPrice ? Number(product.maxRetailPrice) : null,
      composition: product.composition,
      manufacturer: product.manufacturer,
      drug_schedule: product.drugSchedule,
      storage_temp: product.storageTemp,
      requires_prescription: product.requiresPrescription,
      units_per_strip: product.unitsPerStrip,
      strips_per_box: product.stripsPerBox,
      hsn_code: product.hsnCode,
      gst_rate: product.gstRate ? Number(product.gstRate) : 12
    }

    return NextResponse.json({ product: responseData }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
