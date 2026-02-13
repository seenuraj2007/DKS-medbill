import { prisma } from './prisma'

export interface User {
  id: string
  email: string
  full_name?: string
  organization_id?: string
  role?: string
  status?: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  sku?: string
  barcode?: string
  category?: string
  current_quantity: number
  reorder_point: number
  supplier_name?: string
  supplier_email?: string
  supplier_phone?: string
  supplier_id?: string
  unit_cost?: number
  selling_price?: number
  unit?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  user_id: string
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  user_id: string
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface StockHistory {
  id: string
  product_id: string
  location_id?: string
  previous_quantity: number
  quantity_change: number
  new_quantity: number
  change_type: 'add' | 'remove' | 'restock' | 'transfer_in' | 'transfer_out'
  notes?: string
  reference_id?: number
  reference_type?: string
  created_at: string
}

export interface Alert {
  id: string
  user_id: string
  product_id: string
  location_id?: string
  organization_id?: string
  alert_type: 'low_stock' | 'out_of_stock' | 'purchase_order'
  message: string
  is_read: boolean
  is_sent: boolean
  sent_at?: string
  reference_id?: number
  reference_type?: string
  created_at: string
}

export async function ensureDefaultLocations(tenantId: string) {
  if (!tenantId) return

  const existingLocation = await prisma.location.findFirst({
    where: { tenantId }
  })

  if (!existingLocation) {
    await prisma.location.create({
      data: {
        tenantId,
        name: 'Default Location',
        address: 'Main warehouse',
        isPrimary: true,
        type: 'WAREHOUSE'
      }
    })
  }
}

export async function getProductTotalQuantity(productId: string): Promise<number> {
  const stockLevels = await prisma.stockLevel.findMany({
    where: { productId }
  })

  return stockLevels.reduce((sum: number, item: any) => sum + item.quantity, 0)
}

export async function getProductQuantityAtLocation(
  productId: string,
  locationId: string
): Promise<number> {
  const stockLevel = await prisma.stockLevel.findFirst({
    where: { productId, locationId }
  })

  return stockLevel?.quantity || 0
}

export async function updateProductQuantityAtLocation(
  productId: string,
  locationId: string,
  change: number
): Promise<number> {
  const currentQuantity = await getProductQuantityAtLocation(productId, locationId)
  const newQuantity = currentQuantity + change

  await prisma.stockLevel.upsert({
    where: {
      tenantId_productId_locationId: {
        tenantId: '', // This should be set from context
        productId,
        locationId
      }
    },
    update: { quantity: newQuantity },
    create: {
      tenantId: '', // This should be set from context
      productId,
      locationId,
      quantity: newQuantity
    }
  })

  return newQuantity
}

export async function updateProductCurrentQuantity(productId: string): Promise<void> {
  const totalQuantity = await getProductTotalQuantity(productId)
  
  // Update the product's reorder point stock level
  const stockLevels = await prisma.stockLevel.findMany({
    where: { productId }
  })

  if (stockLevels.length > 0) {
    await prisma.stockLevel.updateMany({
      where: { productId },
      data: { quantity: totalQuantity }
    })
  }
}

// Export prisma as default for backward compatibility
export default prisma
