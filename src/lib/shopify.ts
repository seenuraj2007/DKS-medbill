import crypto from 'crypto'

const SHOPIFY_API_VERSION = '2024-01'

export interface ShopifyConfig {
  shopName: string
  accessToken: string
  apiKey?: string
  apiSecret?: string
}

export interface ShopifyProduct {
  id: string
  title: string
  body_html: string
  vendor: string
  product_type: string
  handle: string
  status: string
  tags: string
  variants: ShopifyVariant[]
  images: ShopifyImage[]
  created_at: string
  updated_at: string
}

export interface ShopifyVariant {
  id: string
  product_id: string
  title: string
  price: string
  sku: string
  barcode: string
  inventory_quantity: number
  inventory_item_id: string
  weight: number
  weight_unit: string
}

export interface ShopifyImage {
  id: string
  src: string
  alt: string
}

export interface ShopifyOrder {
  id: string
  order_number: number
  email: string
  created_at: string
  updated_at: string
  total_price: string
  subtotal_price: string
  total_tax: string
  currency: string
  financial_status: string
  fulfillment_status: string | null
  customer: ShopifyCustomer
  line_items: ShopifyLineItem[]
  shipping_address: ShopifyAddress
  billing_address: ShopifyAddress
}

export interface ShopifyCustomer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string
}

export interface ShopifyLineItem {
  id: string
  product_id: string
  variant_id: string
  title: string
  quantity: number
  price: string
  sku: string
  name: string
}

export interface ShopifyAddress {
  first_name: string
  last_name: string
  address1: string
  address2: string
  city: string
  province: string
  country: string
  zip: string
  phone: string
}

export interface ShopifyInventoryLevel {
  inventory_item_id: string
  location_id: string
  available: number
}

export interface ShopifyLocation {
  id: string
  name: string
  active: boolean
  address1: string
  city: string
  country: string
}

export class ShopifyClient {
  private shopName: string
  private accessToken: string
  private baseUrl: string

  constructor(config: ShopifyConfig) {
    this.shopName = config.shopName
    this.accessToken = config.accessToken
    this.baseUrl = `https://${this.shopName}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Shopify API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async getProducts(limit = 250, since_id?: string): Promise<{ products: ShopifyProduct[] }> {
    let endpoint = `/products.json?limit=${limit}`
    if (since_id) {
      endpoint += `&since_id=${since_id}`
    }
    return this.request(endpoint)
  }

  async getProduct(productId: string): Promise<{ product: ShopifyProduct }> {
    return this.request(`/products/${productId}.json`)
  }

  async createProduct(product: Partial<ShopifyProduct>): Promise<{ product: ShopifyProduct }> {
    return this.request('/products.json', {
      method: 'POST',
      body: JSON.stringify({ product }),
    })
  }

  async updateProduct(
    productId: string,
    product: Partial<ShopifyProduct>
  ): Promise<{ product: ShopifyProduct }> {
    return this.request(`/products/${productId}.json`, {
      method: 'PUT',
      body: JSON.stringify({ product }),
    })
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.request(`/products/${productId}.json`, {
      method: 'DELETE',
    })
  }

  async getOrders(
    status = 'any',
    limit = 250,
    created_at_min?: string
  ): Promise<{ orders: ShopifyOrder[] }> {
    let endpoint = `/orders.json?status=${status}&limit=${limit}`
    if (created_at_min) {
      endpoint += `&created_at_min=${created_at_min}`
    }
    return this.request(endpoint)
  }

  async getOrder(orderId: string): Promise<{ order: ShopifyOrder }> {
    return this.request(`/orders/${orderId}.json`)
  }

  async getLocations(): Promise<{ locations: ShopifyLocation[] }> {
    return this.request('/locations.json')
  }

  async getInventoryLevels(locationId: string): Promise<{ inventory_levels: ShopifyInventoryLevel[] }> {
    return this.request(`/inventory_levels.json?location_ids=${locationId}`)
  }

  async setInventoryLevel(
    inventoryItemId: string,
    locationId: string,
    available: number
  ): Promise<{ inventory_level: ShopifyInventoryLevel }> {
    return this.request('/inventory_levels/set.json', {
      method: 'POST',
      body: JSON.stringify({
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available,
      }),
    })
  }

  async adjustInventory(
    inventoryItemId: string,
    locationId: string,
    adjustment: number
  ): Promise<{ inventory_level: ShopifyInventoryLevel }> {
    return this.request('/inventory_levels/adjust.json', {
      method: 'POST',
      body: JSON.stringify({
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available_adjustment: adjustment,
      }),
    })
  }

  async getWebhooks(): Promise<{ webhooks: Array<{ id: string; topic: string; address: string }> }> {
    return this.request('/webhooks.json')
  }

  async createWebhook(topic: string, address: string): Promise<{ webhook: { id: string } }> {
    return this.request('/webhooks.json', {
      method: 'POST',
      body: JSON.stringify({
        webhook: { topic, address, format: 'json' },
      }),
    })
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.request(`/webhooks/${webhookId}.json`, {
      method: 'DELETE',
    })
  }

  generateInstallUrl(redirectUri: string, scopes: string[]): string {
    const apiKey = process.env.SHOPIFY_API_KEY
    if (!apiKey) {
      throw new Error('SHOPIFY_API_KEY not configured')
    }
    
    const nonce = crypto.randomBytes(16).toString('hex')
    const scopeString = scopes.join(',')
    
    return `https://${this.shopName}.myshopify.com/admin/oauth/authorize?` +
      `client_id=${apiKey}` +
      `&scope=${scopeString}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${nonce}`
  }

  async exchangeCodeForToken(code: string): Promise<{ access_token: string; scope: string }> {
    const apiKey = process.env.SHOPIFY_API_KEY
    const apiSecret = process.env.SHOPIFY_API_SECRET
    
    if (!apiKey || !apiSecret) {
      throw new Error('SHOPIFY_API_KEY or SHOPIFY_API_SECRET not configured')
    }

    const response = await fetch(
      `https://${this.shopName}.myshopify.com/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: apiKey,
          client_secret: apiSecret,
          code,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to exchange code for access token')
    }

    return response.json()
  }
}

export function mapShopifyProductToLocal(product: ShopifyProduct) {
  return {
    name: product.title,
    sku: product.variants[0]?.sku || null,
    barcode: product.variants[0]?.barcode || null,
    category: product.product_type || null,
    current_quantity: product.variants[0]?.inventory_quantity || 0,
    unit_cost: 0,
    selling_price: parseFloat(product.variants[0]?.price || '0'),
    image_url: product.images[0]?.src || null,
  }
}

export function mapLocalProductToShopify(product: Record<string, unknown>) {
  return {
    product: {
      title: product.name,
      body_html: '',
      product_type: product.category || '',
      status: 'active',
      variants: [
        {
          price: product.selling_price,
          sku: product.sku,
          barcode: product.barcode,
          inventory_management: 'shopify',
        },
      ],
    },
  }
}

export function mapShopifyOrderToLocal(order: ShopifyOrder) {
  return {
    customer_email: order.customer.email,
    customer_name: `${order.customer.first_name} ${order.customer.last_name}`.trim(),
    total_amount: parseFloat(order.total_price),
    status: order.fulfillment_status === 'fulfilled' ? 'completed' : 'pending',
    shipping_address: order.shipping_address,
    billing_address: order.billing_address,
  }
}
