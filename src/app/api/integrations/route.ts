import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { syncService } from '@/lib/integration-sync'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integrations = await syncService.getAllIntegrations(user.id)

    const sanitized = integrations.map(i => ({
      id: i.id,
      platform: i.platform,
      store_name: i.store_name,
      store_url: i.store_url,
      is_active: i.is_active,
      sync_products: i.sync_products,
      sync_orders: i.sync_orders,
      sync_inventory: i.sync_inventory,
      last_sync_at: i.last_sync_at,
      last_sync_status: i.last_sync_status,
    }))

    return NextResponse.json({ integrations: sanitized })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { platform, store_name, store_url, api_key, api_secret, access_token, sync_products, sync_orders, sync_inventory } = body

    if (!platform || !['shopify', 'woocommerce'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    if (!store_name || !store_url) {
      return NextResponse.json({ error: 'Store name and URL are required' }, { status: 400 })
    }

    const integration = await syncService.saveIntegration({
      user_id: user.id,
      platform,
      store_name,
      store_url,
      api_key,
      api_secret,
      access_token,
      is_active: true,
      sync_products: sync_products ?? true,
      sync_orders: sync_orders ?? true,
      sync_inventory: sync_inventory ?? true,
    })

    return NextResponse.json({
      integration: {
        id: integration.id,
        platform: integration.platform,
        store_name: integration.store_name,
        store_url: integration.store_url,
        is_active: integration.is_active,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json({ error: 'Failed to create integration' }, { status: 500 })
  }
}
