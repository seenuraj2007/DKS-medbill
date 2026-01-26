import { NextRequest, NextResponse } from 'next/server'
import { syncService } from '@/lib/integration-sync'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.redirect(new URL('/auth?error=unauthorized', req.url))
    }

    const { searchParams } = new URL(req.url)
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'true') {
      const consumerKey = searchParams.get('consumer_key')
      const consumerSecret = searchParams.get('consumer_secret')

      if (consumerKey && consumerSecret) {
        const storeUrl = process.env.WOOCOMMERCE_STORE_URL || ''

        await syncService.saveIntegration({
          user_id: user.id,
          platform: 'woocommerce',
          store_name: 'WooCommerce Store',
          store_url: storeUrl,
          api_key: consumerKey,
          api_secret: consumerSecret,
          access_token: '',
          is_active: true,
        })

        return NextResponse.redirect(new URL('/settings/integrations?success=woocommerce_connected', req.url))
      }
    }

    if (error) {
      return NextResponse.redirect(new URL(`/settings/integrations?error=${error}`, req.url))
    }

    return NextResponse.redirect(new URL('/settings/integrations?error=unknown', req.url))
  } catch (err) {
    console.error('WooCommerce callback error:', err)
    return NextResponse.redirect(new URL('/settings/integrations?error=connection_failed', req.url))
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { store_url, consumer_key, consumer_secret } = body

    if (!store_url || !consumer_key || !consumer_secret) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    await syncService.saveIntegration({
      user_id: user.id,
      platform: 'woocommerce',
      store_name: 'WooCommerce Store',
      store_url,
      api_key: consumer_key,
      api_secret: consumer_secret,
      access_token: '',
      is_active: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving WooCommerce integration:', error)
    return NextResponse.json({ error: 'Failed to save integration' }, { status: 500 })
  }
}
