import { z } from 'zod'

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters').trim()
})

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name must be less than 200 characters').trim(),
  sku: z.string().max(100, 'SKU must be less than 100 characters').nullable().optional(),
  barcode: z.string().max(100, 'Barcode must be less than 100 characters').nullable().optional(),
  category: z.string().max(100, 'Category must be less than 100 characters').nullable().optional(),
  current_quantity: z.number().int().min(0, 'Quantity must be a non-negative integer'),
  reorder_point: z.number().int().min(0, 'Reorder point must be a non-negative integer'),
  supplier_id: z.string().uuid('Invalid supplier ID').nullable().optional(),
  supplier_name: z.string().max(200, 'Supplier name must be less than 200 characters').nullable().optional(),
  supplier_email: z.string().email('Invalid supplier email').nullable().optional(),
  supplier_phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').max(50, 'Phone number must be less than 50 characters').nullable().optional(),
  unit_cost: z.number().nonnegative('Unit cost must be a non-negative number'),
  selling_price: z.number().nonnegative('Selling price must be a non-negative number'),
  unit: z.string().max(50, 'Unit must be less than 50 characters').default('unit'),
  image_url: z.string().url('Invalid image URL').nullable().optional()
})

export const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(200, 'Location name must be less than 200 characters').trim().refine(
    val => !/<[^>]*>/.test(val),
    { message: 'Name cannot contain HTML' }
  ),
  address: z.string().max(500, 'Address must be less than 500 characters').nullable().optional(),
  city: z.string().max(100, 'City must be less than 100 characters').nullable().optional(),
  state: z.string().max(100, 'State must be less than 100 characters').nullable().optional(),
  zip: z.string().max(20, 'Zip code must be less than 20 characters').nullable().optional(),
  country: z.string().max(100, 'Country must be less than 100 characters').nullable().optional(),
  is_primary: z.boolean().default(false)
})

export const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(200, 'Supplier name must be less than 200 characters').trim(),
  contact_person: z.string().max(200, 'Contact person must be less than 200 characters').nullable().optional(),
  email: z.string().email('Invalid email').nullable().optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').max(50, 'Phone number must be less than 50 characters').nullable().optional(),
  address: z.string().max(500, 'Address must be less than 500 characters').nullable().optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').nullable().optional()
})

export const stockUpdateSchema = z.object({
  quantity_change: z.number().int().min(1, 'Quantity must be at least 1').max(100000, 'Quantity too large'),
  change_type: z.enum(['add', 'remove', 'restock'], { message: 'Invalid change type' }),
  notes: z.string().max(500, 'Notes too long').nullable().optional(),
  location_id: z.number().int().positive('Invalid location ID').nullable().optional()
})

export const stockTransferSchema = z.object({
  from_location_id: z.number().int().positive('Source location is required'),
  to_location_id: z.number().int().positive('Destination location is required'),
  items: z.array(z.object({
    product_id: z.number().int().positive('Product is required'),
    quantity: z.number().int().positive('Quantity must be positive')
  })).min(1, 'At least one item is required'),
  notes: z.string().max(500, 'Notes too long').nullable().optional()
})

export const purchaseOrderSchema = z.object({
  supplier_id: z.number().int().positive('Supplier is required'),
  items: z.array(z.object({
    product_id: z.number().int().positive('Product is required'),
    quantity: z.number().int().positive('Quantity must be at least 1'),
    unit_cost: z.number().nonnegative('Unit cost must be non-negative')
  })).min(1, 'At least one item is required'),
  notes: z.string().max(500, 'Notes too long').nullable().optional()
})

export const roleSchema = z.enum(['owner', 'admin', 'editor', 'viewer'], {
  message: 'Invalid role'
})

export const teamMemberSchema = z.object({
  email: z.string().email('Invalid email'),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name too long').trim(),
  role: roleSchema
})

export const idSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid ID format')
})

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Invalid page number').optional(),
  limit: z.string().regex(/^\d+$/, 'Invalid limit').optional(),
  search: z.string().max(100, 'Search term too long').optional()
})
