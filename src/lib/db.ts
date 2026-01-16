import { supabase } from './supabase'

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

export async function ensureDefaultLocations(userId: string) {
  if (!userId) return

  const { data: existingLocation } = await supabase
    .from('locations')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!existingLocation) {
    await supabase
      .from('locations')
      .insert({
        user_id: userId,
        name: 'Default Location',
        address: 'Main warehouse',
        is_primary: true
      })
  }
}

export async function getProductTotalQuantity(productId: string): Promise<number> {
  const { data, error } = await supabase
    .from('product_stock')
    .select('quantity')
    .eq('product_id', productId)

  if (error) {
    console.error('Error getting product total quantity:', error)
    return 0
  }

  return data?.reduce((sum, item) => sum + item.quantity, 0) || 0
}

export async function getProductQuantityAtLocation(
  productId: string,
  locationId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('product_stock')
    .select('quantity')
    .eq('product_id', productId)
    .eq('location_id', locationId)
    .single()

  if (error || !data) {
    return 0
  }

  return data.quantity
}

export async function updateProductQuantityAtLocation(
  productId: string,
  locationId: string,
  change: number
): Promise<number> {
  const currentQuantity = await getProductQuantityAtLocation(productId, locationId)
  const newQuantity = currentQuantity + change

  const { error } = await supabase
    .from('product_stock')
    .upsert({
      product_id: productId,
      location_id: locationId,
      quantity: newQuantity
    })

  if (error) {
    console.error('Error updating product quantity:', error)
    throw error
  }

  return newQuantity
}

export async function updateProductCurrentQuantity(productId: string): Promise<void> {
  const totalQuantity = await getProductTotalQuantity(productId)

  await supabase
    .from('products')
    .update({ current_quantity: totalQuantity })
    .eq('id', productId)
}

export default supabase
