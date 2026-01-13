export interface User {
  id: number
  email: string
  full_name: string | null
  created_at: string
}

export interface Location {
  id: number
  user_id: number
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  is_primary: number
  created_at: string
  updated_at: string
  total_products?: number
}

export interface Supplier {
  id: number
  user_id: number
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  total_products?: number
}

export interface Product {
  id: number
  user_id: number
  name: string
  sku: string | null
  barcode: string | null
  category: string | null
  current_quantity: number
  reorder_point: number
  supplier_id: number | null
  supplier_name: string | null
  supplier_email: string | null
  supplier_phone: string | null
  unit_cost: number
  selling_price: number
  unit: string
  image_url: string | null
  created_at: string
  updated_at: string
  needs_restock?: boolean
  is_out_of_stock?: boolean
  supplier?: Supplier
  locations?: ProductStock[]
}

export interface ProductStock {
  id: number
  product_id: number
  location_id: number
  quantity: number
  created_at: string
  updated_at: string
  location_name?: string
}

export interface StockHistory {
  id: number
  product_id: number
  location_id: number | null
  previous_quantity: number
  quantity_change: number
  new_quantity: number
  change_type: 'add' | 'remove' | 'restock' | 'transfer_in' | 'transfer_out'
  notes: string | null
  reference_id: number | null
  reference_type: string | null
  created_at: string
  product_name?: string
  location_name?: string
}

export interface PurchaseOrder {
  id: number
  user_id: number
  supplier_id: number
  order_number: string
  status: 'pending' | 'sent' | 'received' | 'cancelled'
  total_cost: number
  notes: string | null
  created_at: string
  updated_at: string
  supplier?: Supplier
  items?: PurchaseOrderItem[]
}

export interface PurchaseOrderItem {
  id: number
  purchase_order_id: number
  product_id: number
  quantity: number
  unit_cost: number
  total_cost: number
  received_quantity: number
  created_at: string
  product_name?: string
  product_sku?: string
}

export interface StockTransfer {
  id: number
  user_id: number
  from_location_id: number
  to_location_id: number
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  from_location?: Location
  to_location?: Location
  items?: StockTransferItem[]
}

export interface StockTransferItem {
  id: number
  stock_transfer_id: number
  product_id: number
  quantity: number
  created_at: string
  product_name?: string
  product_sku?: string
}

export interface Alert {
  id: number
  user_id: number
  product_id: number | null
  location_id: number | null
  alert_type: 'low_stock' | 'out_of_stock' | 'purchase_order'
  message: string
  is_read: number
  is_sent: number
  sent_at: string | null
  reference_id: number | null
  reference_type: string | null
  created_at: string
  product_name?: string
  location_name?: string
}

export interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  unreadAlerts: number
  lowStockItems: Product[]
  totalLocations?: number
  pendingPurchaseOrders?: number
  pendingStockTransfers?: number
}
