/**
 * Core domain types for the application
 * Strictly typed with no any types
 */

// ============================================
// User & Authentication Types
// ============================================
export interface User {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  tenantId: string | null;
  metadata: Record<string, unknown>;
  role: UserRole | null;
  status: string | null;
}

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';

export interface Session {
  user: AuthUser | null;
  expiresAt: Date;
}

// ============================================
// Tenant & Organization Types
// ============================================
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  settings: TenantSettings | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  currency: string;
  timezone: string;
  dateFormat: string;
  gstNumber: string | null;
  businessAddress: string | null;
  businessCity: string | null;
  businessState: string | null;
  businessPincode: string | null;
}

// ============================================
// Product Types
// ============================================
export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  category: string | null;
  currentQuantity: number;
  reorderPoint: number;
  unitCost: number | null;
  sellingPrice: number;
  gstRate: number | null;
  hsnCode: string | null;
  unit: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy product type for backward compatibility
export interface LegacyProduct {
  id: number;
  user_id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  current_quantity: number;
  reorder_point: number;
  supplier_id: number | null;
  supplier_name: string | null;
  supplier_email: string | null;
  supplier_phone: string | null;
  unit_cost: number;
  selling_price: number;
  unit: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  needs_restock?: boolean;
  is_out_of_stock?: boolean;
  supplier?: LegacySupplier;
  locations?: LegacyProductStock[];
}

// ============================================
// Location Types
// ============================================
export interface Location {
  id: string;
  tenantId: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy location type
export interface LegacyLocation {
  id: number;
  user_id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  is_primary: number;
  created_at: string;
  updated_at: string;
  total_products?: number;
}

// ============================================
// Inventory Types
// ============================================
export interface StockLevel {
  id: string;
  tenantId: string;
  productId: string;
  locationId: string;
  quantity: number;
  reservedQuantity: number;
  updatedAt: Date;
}

export interface StockTransfer {
  id: string;
  tenantId: string;
  fromLocationId: string;
  toLocationId: string;
  status: TransferStatus;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  items: StockTransferItem[];
}

export type TransferStatus = 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface StockTransferItem {
  id: string;
  transferId: string;
  productId: string;
  quantity: number;
  receivedQuantity: number | null;
}

// Legacy stock transfer
export interface LegacyStockTransfer {
  id: number;
  user_id: number;
  from_location_id: number;
  to_location_id: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  from_location?: LegacyLocation;
  to_location?: LegacyLocation;
  items?: LegacyStockTransferItem[];
}

export interface LegacyStockTransferItem {
  id: number;
  stock_transfer_id: number;
  product_id: number;
  quantity: number;
  created_at: string;
  product_name?: string;
  product_sku?: string;
}

// ============================================
// Stock History Types
// ============================================
export interface StockHistory {
  id: string;
  productId: string;
  locationId: string | null;
  previousQuantity: number;
  quantityChange: number;
  newQuantity: number;
  changeType: StockChangeType;
  notes: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: Date;
}

export type StockChangeType = 'ADD' | 'REMOVE' | 'RESTOCK' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT';

// Legacy stock history
export interface LegacyStockHistory {
  id: number;
  product_id: number;
  location_id: number | null;
  previous_quantity: number;
  quantity_change: number;
  new_quantity: number;
  change_type: 'add' | 'remove' | 'restock' | 'transfer_in' | 'transfer_out';
  notes: string | null;
  reference_id: number | null;
  reference_type: string | null;
  created_at: string;
  product_name?: string;
  location_name?: string;
}

// ============================================
// Supplier Types
// ============================================
export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy supplier
export interface LegacySupplier {
  id: number;
  user_id: number;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_products?: number;
}

// ============================================
// Invoice Types
// ============================================
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Invoice {
  id: string;
  tenantId: string;
  customerId: string | null;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date | null;
  status: InvoiceStatus;
  businessName: string;
  businessAddress: string | null;
  businessCity: string | null;
  businessState: string | null;
  businessPincode: string | null;
  businessGstNumber: string | null;
  customerName: string;
  customerAddress: string | null;
  customerCity: string | null;
  customerState: string | null;
  customerPincode: string | null;
  customerGstNumber: string | null;
  subtotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalGst: number;
  totalAmount: number;
  notes: string | null;
  terms: string | null;
  ewayBillNumber: string | null;
  ewayBillDate: Date | null;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string | null;
  description: string;
  hsnCode: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

// ============================================
// Customer Types
// ============================================
export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Purchase Order Types
// ============================================
export type POStatus = 'DRAFT' | 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  tenantId: string;
  orderNumber: string;
  supplierName: string;
  supplierEmail: string | null;
  supplierPhone: string | null;
  status: POStatus;
  totalAmount: number;
  notes: string | null;
  orderedBy: string | null;
  orderedAt: Date | null;
  items: PurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  receivedQty: number;
  unitCost: number;
  totalCost: number;
}

// Legacy purchase order
export interface LegacyPurchaseOrder {
  id: number;
  user_id: number;
  supplier_id: number;
  order_number: string;
  status: 'pending' | 'sent' | 'received' | 'cancelled';
  total_cost: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: LegacySupplier;
  items?: LegacyPurchaseOrderItem[];
}

export interface LegacyPurchaseOrderItem {
  id: number;
  purchase_order_id: number;
  product_id: number;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity: number;
  created_at: string;
  product_name?: string;
  product_sku?: string;
}

// ============================================
// Alert Types
// ============================================
export interface Alert {
  id: string;
  tenantId: string;
  productId: string;
  type: AlertType;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export type AlertType = 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY' | 'SYSTEM';

// Legacy alert
export interface LegacyAlert {
  id: number;
  user_id: number;
  product_id: number | null;
  location_id: number | null;
  alert_type: 'low_stock' | 'out_of_stock' | 'purchase_order';
  message: string;
  is_read: number;
  is_sent: number;
  sent_at: string | null;
  reference_id: number | null;
  reference_type: string | null;
  created_at: string;
  product_name?: string;
  location_name?: string;
}

// ============================================
// Product Stock Types
// ============================================
export interface ProductStock {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  updatedAt: Date;
}

// Legacy product stock
export interface LegacyProductStock {
  id: number;
  product_id: number;
  location_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  location_name?: string;
}

// ============================================
// Team/Member Types
// ============================================
export interface TeamMember {
  id: string;
  tenantId: string;
  userId: string;
  role: UserRole;
  invitedAt: Date;
  joinedAt: Date | null;
  status: MemberStatus;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export type MemberStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';

// ============================================
// Dashboard Types
// ============================================
export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  unreadAlerts: number;
  lowStockItems: LowStockItem[];
  subscription: SubscriptionInfo | null;
  usage: UsageStats | null;
}

export interface LowStockItem {
  id: string;
  name: string;
  currentQuantity: number;
  reorderPoint: number;
}

// Legacy dashboard stats
export interface LegacyDashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  unreadAlerts: number;
  lowStockItems: LegacyProduct[];
  totalLocations?: number;
  pendingPurchaseOrders?: number;
  pendingStockTransfers?: number;
}

export interface SubscriptionInfo {
  status: string;
  plan: PlanInfo | null;
  trialEndDate: string | null;
}

export interface PlanInfo {
  name: string;
  displayName: string;
  maxTeamMembers: number;
  maxProducts: number;
  maxLocations: number;
}

export interface UsageStats {
  teamMembers: number;
  products: number;
  locations: number;
}

// ============================================
// Analytics Types
// ============================================
export interface AnalyticsData {
  period: string;
  sales: SalesAnalytics;
  inventory: InventoryAnalytics;
  trends: TrendData[];
}

export interface SalesAnalytics {
  total: number;
  count: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
}

export interface InventoryAnalytics {
  totalValue: number;
  turnoverRate: number;
  stockStatus: StockStatusCounts;
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface StockStatusCounts {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface TrendData {
  date: string;
  value: number;
}

// ============================================
// Settings Types
// ============================================
export interface WhatsAppSettings {
  enabled: boolean;
  phoneNumber: string | null;
  apiKey: string | null;
  defaultMessage: string | null;
  autoSendInvoices: boolean;
  autoSendAlerts: boolean;
}

export interface OrganizationSettings {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  gstNumber: string | null;
  logo: string | null;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details: Record<string, string[]> | null;
  stack?: string;
}

export interface ResponseMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  timestamp: string;
  requestId: string;
}

// ============================================
// Pagination Types
// ============================================
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============================================
// Request Types
// ============================================
export interface CreateInvoiceRequest {
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPincode?: string;
  customerGstNumber?: string;
  invoiceDate: string;
  dueDate?: string;
  notes?: string;
  terms?: string;
  items: CreateInvoiceItemRequest[];
}

export interface CreateInvoiceItemRequest {
  productId?: string;
  description: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
}

export interface CreateProductRequest {
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  category?: string;
  currentQuantity: number;
  reorderPoint: number;
  unitCost?: number;
  sellingPrice: number;
  gstRate?: number;
  hsnCode?: string;
  unit: string;
  imageUrl?: string;
}

// ============================================
// Utility Types
// ============================================
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================
// Component Props Types
// ============================================
export interface WithChildren {
  children: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// ============================================
// Cache Types
// ============================================
export interface CacheConfig {
  key: string;
  ttl: number;
  tags: string[];
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  tags: string[];
}

// ============================================
// Logger Types
// ============================================
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context: Record<string, unknown>;
  error?: Error;
  requestId?: string;
  userId?: string;
  tenantId?: string;
}

// ============================================
// Rate Limiting Types
// ============================================
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter: number | null;
}

// ============================================
// CSRF Types
// ============================================
export interface CSRFToken {
  token: string;
  expiresAt: Date;
}

// ============================================
// Metrics Types
// ============================================
export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  labels: Record<string, string>;
}

// ============================================
// Health Check Types
// ============================================
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastChecked: Date;
  message?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheck[];
  timestamp: Date;
  version: string;
}

// ============================================
// Form Field Types
// ============================================
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern';
  value?: number | string;
  message: string;
}

// ============================================
// Sort & Filter Types
// ============================================
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: string | number | boolean | Date;
}
