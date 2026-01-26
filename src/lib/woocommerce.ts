export interface WooCommerceConfig {
  storeUrl: string
  consumerKey: string
  consumerSecret: string
}

export interface WooCommerceProduct {
  id: number
  name: string
  slug: string
  permalink: string
  type: string
  status: string
  featured: boolean
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  price_html: string
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: string
  backorders: string
  weight: string
  dimensions: {
    length: string
    width: string
    height: string
  }
  categories: Array<{ id: number; name: string; slug: string }>
  tags: Array<{ id: number; name: string; slug: string }>
  images: Array<{ id: number; src: string; alt: string }>
  attributes: Array<{ id: number; name: string; options: string[] }>
  variations: WooCommerceVariation[]
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
}

export interface WooCommerceVariation {
  id: number
  product_id: number
  name: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  manage_stock: boolean
  stock_quantity: number | null
  stock_status: string
  weight: string
  image?: { id: number; src: string }
  attributes: Array<{ id: number; name: string; option: string }>
}

export interface WooCommerceOrder {
  id: number
  number: string
  order_key: string
  status: string
  currency: string
  version: string
  prices_include_tax: boolean
  date_created: string
  date_created_gmt: string
  date_modified: string
  date_modified_gmt: string
  discount_total: string
  discount_tax: string
  shipping_total: string
  shipping_tax: string
  cart_tax: string
  total: string
  total_tax: string
  customer_id: number
  customer_ip_address: string
  customer_user_agent: string
  customer_note: string
  billing: WooCommerceAddress
  shipping: WooCommerceAddress
  payment_method: string
  payment_method_title: string
  transaction_id: string
  line_items: WooCommerceLineItem[]
  tax_lines: Array<{ id: number; rate_code: string; rate_id: number; label: string; compound: boolean; tax_total: string; shipping_tax_total: string }>
  shipping_lines: Array<{ id: number; method_id: string; method_title: string; total: string; total_tax: string }>
  fee_lines: Array<{ id: number; name: string; total: string; total_tax: string }>
}

export interface WooCommerceAddress {
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  state: string
  postcode: string
  country: string
  email: string
  phone: string
}

export interface WooCommerceLineItem {
  id: number
  product_id: number
  variation_id: number
  name: string
  sku: string
  product_name: string
  quantity: number
  price: number
  total: string
}

export interface WooCommerceCustomer {
  id: number
  email: string
  first_name: string
  last_name: string
  role: string
  username: string
  avatar_url: string
  billing: WooCommerceAddress
  shipping: WooCommerceAddress
  orders_count: number
  total_spent: string
  date_created: string
}

export interface WooCommerceReport {
  totals: Array<{
    slug: string
    name: string
    total: number
  }>
}

export class WooCommerceClient {
  private storeUrl: string
  private consumerKey: string
  private consumerSecret: string

  constructor(config: WooCommerceConfig) {
    this.storeUrl = config.storeUrl.replace(/\/$/, '')
    this.consumerKey = config.consumerKey
    this.consumerSecret = config.consumerSecret
  }

  private getAuthParams(): string {
    return `consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.storeUrl}/wp-json/wc/v3${endpoint}`
    const authParams = this.getAuthParams()
    
    const response = await fetch(`${url}${url.includes('?') ? '&' : '?'}${authParams}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`WooCommerce API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async getProducts(params?: {
    per_page?: number
    page?: number
    after?: string
    before?: string
    status?: string
    sku?: string
  }): Promise<WooCommerceProduct[]> {
    let endpoint = '/products?'
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.after) queryParams.append('after', params.after)
      if (params.before) queryParams.append('before', params.before)
      if (params.status) queryParams.append('status', params.status)
      if (params.sku) queryParams.append('sku', params.sku)
      endpoint += queryParams.toString()
    }
    return this.request(endpoint)
  }

  async getProduct(productId: number): Promise<WooCommerceProduct> {
    return this.request(`/products/${productId}`)
  }

  async createProduct(product: Partial<WooCommerceProduct>): Promise<WooCommerceProduct> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  async updateProduct(
    productId: number,
    product: Partial<WooCommerceProduct>
  ): Promise<WooCommerceProduct> {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    })
  }

  async deleteProduct(productId: number, force = false): Promise<void> {
    await this.request(`/products/${productId}?force=${force}`, {
      method: 'DELETE',
    })
  }

  async getOrders(params?: {
    per_page?: number
    page?: number
    after?: string
    before?: string
    status?: string
    customer?: number
  }): Promise<WooCommerceOrder[]> {
    let endpoint = '/orders?'
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.after) queryParams.append('after', params.after)
      if (params.before) queryParams.append('before', params.before)
      if (params.status) queryParams.append('status', params.status)
      if (params.customer) queryParams.append('customer', params.customer.toString())
      endpoint += queryParams.toString()
    }
    return this.request(endpoint)
  }

  async getOrder(orderId: number): Promise<WooCommerceOrder> {
    return this.request(`/orders/${orderId}`)
  }

  async getCustomers(params?: {
    per_page?: number
    page?: number
    email?: string
  }): Promise<WooCommerceCustomer[]> {
    let endpoint = '/customers?'
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.per_page) queryParams.append('per_page', params.per_page.toString())
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.email) queryParams.append('email', params.email)
      endpoint += queryParams.toString()
    }
    return this.request(endpoint)
  }

  async getProductVariations(productId: number): Promise<WooCommerceVariation[]> {
    return this.request(`/products/${productId}/variations`)
  }

  async updateProductStock(
    productId: number,
    stockQuantity: number | null,
    manageStock = true
  ): Promise<WooCommerceProduct> {
    return this.updateProduct(productId, {
      manage_stock: manageStock,
      stock_quantity: stockQuantity,
      stock_status: stockQuantity === null ? 'outofstock' : stockQuantity > 0 ? 'instock' : 'outofstock',
    })
  }

  async batchUpdateProducts(products: Array<{ id?: number } & Partial<WooCommerceProduct>>): Promise<{ create: WooCommerceProduct[]; update: WooCommerceProduct[]; delete: number[] }> {
    return this.request('/products/batch', {
      method: 'POST',
      body: JSON.stringify({ update: products }),
    })
  }

  async getReports(params?: {
    period?: 'week' | 'month' | 'quarter' | 'year'
    date_min?: string
    date_max?: string
  }): Promise<WooCommerceReport> {
    let endpoint = '/reports?'
    if (params) {
      const queryParams = new URLSearchParams()
      if (params.period) queryParams.append('period', params.period)
      if (params.date_min) queryParams.append('date_min', params.date_min)
      if (params.date_max) queryParams.append('date_max', params.date_max)
      endpoint += queryParams.toString()
    }
    return this.request(endpoint)
  }

  async getSystemStatus(): Promise<Record<string, unknown>> {
    return this.request('/system_status')
  }

  generateInstallUrl(): string {
    const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY
    const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET
    
    if (!consumerKey || !consumerSecret) {
      throw new Error('WOOCOMMERCE_CONSUMER_KEY or WOOCOMMERCE_CONSUMER_SECRET not configured')
    }

    const callbackUrl = `${process.env.APP_URL}/api/integrations/woocommerce/callback`
    
    return `${this.storeUrl}/wc-auth/authorize?` +
      `app_name=DKS%20StockAlert` +
      `&scope=read_write` +
      `&user_id=1` +
      `&return_url=${encodeURIComponent(callbackUrl)}` +
      `&consumer_key=${consumerKey}` +
      `&consumer_secret=${consumerSecret}`
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.request('/system_status')
      return true
    } catch {
      return false
    }
  }
}

export function mapWooCommerceProductToLocal(product: WooCommerceProduct) {
  return {
    name: product.name,
    sku: product.sku || null,
    barcode: null,
    category: product.categories[0]?.name || null,
    current_quantity: product.manage_stock ? (product.stock_quantity ?? 0) : 0,
    unit_cost: parseFloat(product.regular_price || '0'),
    selling_price: parseFloat(product.price || '0'),
    image_url: product.images[0]?.src || null,
  }
}

export function mapLocalProductToWooCommerce(product: Record<string, unknown>) {
  return {
    name: product.name,
    sku: product.sku,
    regular_price: product.selling_price?.toString() || '0',
    manage_stock: true,
    stock_quantity: product.current_quantity,
    categories: product.category ? [{ id: 0, name: product.category, slug: '' }] : [],
  }
}

export function mapWooCommerceOrderToLocal(order: WooCommerceOrder) {
  return {
    customer_email: order.billing.email,
    customer_name: `${order.billing.first_name} ${order.billing.last_name}`.trim(),
    total_amount: parseFloat(order.total),
    status: order.status === 'completed' ? 'completed' : 'pending',
    shipping_address: order.shipping,
    billing_address: order.billing,
  }
}
