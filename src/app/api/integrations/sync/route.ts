import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { syncService } from '@/lib/integration-sync'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { integration_id, sync_type } = await req.json()

    if (!integration_id) {
      return NextResponse.json({ error: 'Integration ID is required' }, { status: 400 })
    }

    const integration = await syncService.getIntegration(user.id, 'shopify')
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    let result
    if (sync_type === 'products') {
      result = await syncService.syncProducts(integration)
    } else if (sync_type === 'orders') {
      result = await syncService.syncOrders(integration)
    } else {
      return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 })
    }

    return NextResponse.json({ success: result.success, result })
  } catch (error) {
    console.error('Error syncing integration:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
