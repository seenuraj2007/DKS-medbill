import { z } from 'zod'

export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine(
    (val) => !/(.)\1{2,}/.test(val),
    'Password must not contain 3 or more consecutive identical characters'
  )

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
