import { supabaseAdmin } from './serverSupabase'
import { ShopifyClient, mapShopifyProductToLocal, mapLocalProductToShopify } from './shopify'
import { WooCommerceClient, mapWooCommerceProductToLocal, mapLocalProductToWooCommerce } from './woocommerce'

export type IntegrationPlatform = 'shopify' | 'woocommerce'

export interface Integration {
  id: string
  user_id: string
  platform: IntegrationPlatform
  store_name: string
  store_url: string
  api_key?: string
  api_secret?: string
  access_token: string
  scope?: string
  is_active: boolean
  sync_products: boolean
  sync_orders: boolean
  sync_inventory: boolean
  last_sync_at?: string
  last_sync_status?: string
  last_sync_error?: string
}

export interface SyncResult {
  success: boolean
  items_processed: number
  items_created: number
  items_updated: number
  items_failed: number
  errors: string[]
}

export class IntegrationSyncService {
  async getIntegration(userId: string, platform: IntegrationPlatform): Promise<Integration | null> {
    const { data, error } = await supabaseAdmin!
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('is_active', true)
      .single()

    if (error || !data) return null
    return data as Integration
  }

  async getAllIntegrations(userId: string): Promise<Integration[]> {
    const { data, error } = await supabaseAdmin!
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) return []
    return data as Integration[]
  }

  async saveIntegration(integration: Partial<Integration>): Promise<Integration> {
    const { data, error } = await supabaseAdmin!
      .from('integrations')
      .upsert({
        ...integration,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to save integration: ${error.message}`)
    return data as Integration
  }

  async deleteIntegration(integrationId: string): Promise<void> {
    await supabaseAdmin!.from('integrations').delete().eq('id', integrationId)
  }

  async logSync(
    integrationId: string,
    syncType: 'products' | 'orders' | 'inventory',
    result: SyncResult
  ): Promise<void> {
    await supabaseAdmin!.from('integration_sync_logs').insert({
      integration_id: integrationId,
      sync_type: syncType,
      status: result.success ? 'completed' : 'failed',
      items_processed: result.items_processed,
      items_created: result.items_created,
      items_updated: result.items_updated,
      items_failed: result.items_failed,
      error_message: result.errors.join('; '),
      completed_at: new Date().toISOString(),
    })

    await supabaseAdmin!.from('integrations').update({
      last_sync_at: new Date().toISOString(),
      last_sync_status: result.success ? 'success' : 'failed',
      last_sync_error: result.errors.join('; '),
    }).eq('id', integrationId)
  }

  async syncProducts(integration: Integration): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      items_processed: 0,
      items_created: 0,
      items_updated: 0,
      items_failed: 0,
      errors: [],
    }

    try {
      if (integration.platform === 'shopify') {
        await this.syncShopifyProducts(integration, result)
      } else if (integration.platform === 'woocommerce') {
        await this.syncWooCommerceProducts(integration, result)
      }
    } catch (error) {
      result.success = false
      result.errors.push(`Sync failed: ${error}`)
    }

    await this.logSync(integration.id, 'products', result)
    return result
  }

  private async syncShopifyProducts(integration: Integration, result: SyncResult): Promise<void> {
    const shopify = new ShopifyClient({
      shopName: integration.store_name,
      accessToken: integration.access_token,
    })

    const { products } = await shopify.getProducts(250)
    result.items_processed = products.length

    for (const product of products) {
      try {
        const localProduct = mapShopifyProductToLocal(product)

        const { data: existingMapping } = await supabaseAdmin!
          .from('product_mappings')
          .select('product_id')
          .eq('integration_id', integration.id)
          .eq('external_id', product.id)
          .single()

        if (existingMapping) {
          await supabaseAdmin!.from('products').update(localProduct).eq('id', existingMapping.product_id)
          result.items_updated++
        } else {
          const { data: newProduct, error: insertError } = await supabaseAdmin!
            .from('products')
            .insert({
              ...localProduct,
              user_id: integration.user_id,
            })
            .select()
            .single()

          if (insertError) throw insertError

          await supabaseAdmin!.from('product_mappings').insert({
            product_id: newProduct.id,
            integration_id: integration.id,
            external_id: product.id,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
          })

          result.items_created++
        }
      } catch (error) {
        result.items_failed++
        result.errors.push(`Failed to sync product ${product.id}: ${error}`)
      }
    }
  }

  private async syncWooCommerceProducts(integration: Integration, result: SyncResult): Promise<void> {
    const woo = new WooCommerceClient({
      storeUrl: integration.store_url,
      consumerKey: integration.api_key || '',
      consumerSecret: integration.api_secret || '',
    })

    const products = await woo.getProducts({ per_page: 100 })
    result.items_processed = products.length

    for (const product of products) {
      try {
        const localProduct = mapWooCommerceProductToLocal(product)

        const { data: existingMapping } = await supabaseAdmin!
          .from('product_mappings')
          .select('product_id')
          .eq('integration_id', integration.id)
          .eq('external_id', product.id.toString())
          .single()

        if (existingMapping) {
          await supabaseAdmin!.from('products').update(localProduct).eq('id', existingMapping.product_id)
          result.items_updated++
        } else {
          const { data: newProduct, error: insertError } = await supabaseAdmin!
            .from('products')
            .insert({
              ...localProduct,
              user_id: integration.user_id,
            })
            .select()
            .single()

          if (insertError) throw insertError

          await supabaseAdmin!.from('product_mappings').insert({
            product_id: newProduct.id,
            integration_id: integration.id,
            external_id: product.id.toString(),
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
          })

          result.items_created++
        }
      } catch (error) {
        result.items_failed++
        result.errors.push(`Failed to sync product ${product.id}: ${error}`)
      }
    }
  }

  async syncInventory(integration: Integration, localProductId: string, quantity: number): Promise<void> {
    const { data: mapping } = await supabaseAdmin!
      .from('product_mappings')
      .select('*')
      .eq('product_id', localProductId)
      .eq('integration_id', integration.id)
      .single()

    if (!mapping) return

    if (integration.platform === 'shopify') {
      const shopify = new ShopifyClient({
        shopName: integration.store_name,
        accessToken: integration.access_token,
      })

      const { product } = await shopify.getProduct(mapping.external_id)
      const variantId = mapping.external_variant_id || product.variants[0]?.id

      if (variantId) {
        await shopify.setInventoryLevel(
          product.variants[0]?.inventory_item_id || '',
          '',
          quantity
        )
      }
    } else if (integration.platform === 'woocommerce') {
      const woo = new WooCommerceClient({
        storeUrl: integration.store_url,
        consumerKey: integration.api_key || '',
        consumerSecret: integration.api_secret || '',
      })

      await woo.updateProductStock(parseInt(mapping.external_id), quantity)
    }

    await supabaseAdmin!.from('product_mappings').update({
      last_synced_at: new Date().toISOString(),
      sync_status: 'synced',
    }).eq('id', mapping.id)
  }

  async syncOrders(integration: Integration): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      items_processed: 0,
      items_created: 0,
      items_updated: 0,
      items_failed: 0,
      errors: [],
    }

    try {
      if (integration.platform === 'shopify') {
        await this.syncShopifyOrders(integration, result)
      } else if (integration.platform === 'woocommerce') {
        await this.syncWooCommerceOrders(integration, result)
      }
    } catch (error) {
      result.success = false
      result.errors.push(`Order sync failed: ${error}`)
    }

    await this.logSync(integration.id, 'orders', result)
    return result
  }

  private async syncShopifyOrders(integration: Integration, result: SyncResult): Promise<void> {
    const shopify = new ShopifyClient({
      shopName: integration.store_name,
      accessToken: integration.access_token,
    })

    const { orders } = await shopify.getOrders('any', 100)
    result.items_processed = orders.length

    for (const order of orders) {
      try {
        const { data: existingMapping } = await supabaseAdmin!
          .from('order_mappings')
          .select('id')
          .eq('integration_id', integration.id)
          .eq('external_order_id', order.id.toString())
          .single()

        if (!existingMapping) {
          const orderData = {
            user_id: integration.user_id,
            customer_email: order.customer.email,
            customer_name: `${order.customer.first_name} ${order.customer.last_name}`.trim(),
            total_amount: parseFloat(order.total_price),
            status: order.fulfillment_status === 'fulfilled' ? 'completed' : 'pending',
          }

          const { data: newOrder, error: insertError } = await supabaseAdmin!
            .from('sales')
            .insert(orderData)
            .select()
            .single()

          if (insertError) throw insertError

          await supabaseAdmin!.from('order_mappings').insert({
            local_order_id: newOrder.id,
            integration_id: integration.id,
            external_order_id: order.id.toString(),
            external_order_number: order.order_number.toString(),
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
          })

          result.items_created++
        }
      } catch (error) {
        result.items_failed++
        result.errors.push(`Failed to sync order ${order.id}: ${error}`)
      }
    }
  }

  private async syncWooCommerceOrders(integration: Integration, result: SyncResult): Promise<void> {
    const woo = new WooCommerceClient({
      storeUrl: integration.store_url,
      consumerKey: integration.api_key || '',
      consumerSecret: integration.api_secret || '',
    })

    const orders = await woo.getOrders({ per_page: 100 })
    result.items_processed = orders.length

    for (const order of orders) {
      try {
        const { data: existingMapping } = await supabaseAdmin!
          .from('order_mappings')
          .select('id')
          .eq('integration_id', integration.id)
          .eq('external_order_id', order.id.toString())
          .single()

        if (!existingMapping) {
          const orderData = {
            user_id: integration.user_id,
            customer_email: order.billing.email,
            customer_name: `${order.billing.first_name} ${order.billing.last_name}`.trim(),
            total_amount: parseFloat(order.total),
            status: order.status === 'completed' ? 'completed' : 'pending',
          }

          const { data: newOrder, error: insertError } = await supabaseAdmin!
            .from('sales')
            .insert(orderData)
            .select()
            .single()

          if (insertError) throw insertError

          await supabaseAdmin!.from('order_mappings').insert({
            local_order_id: newOrder.id,
            integration_id: integration.id,
            external_order_id: order.id.toString(),
            external_order_number: order.number,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
          })

          result.items_created++
        }
      } catch (error) {
        result.items_failed++
        result.errors.push(`Failed to sync order ${order.id}: ${error}`)
      }
    }
  }
}

export const syncService = new IntegrationSyncService()
