import { NextRequest, NextResponse } from 'next/server'
import { ShopifyClient } from '@/lib/shopify'
import { syncService } from '@/lib/integration-sync'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.redirect(new URL('/auth?error=unauthorized', req.url))
    }

    const { searchParams } = new URL(req.url)
    const shop = searchParams.get('shop')
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL(`/settings/integrations?error=${error}`, req.url))
    }

    if (!shop || !code) {
      return NextResponse.redirect(new URL('/settings/integrations?error=missing_params', req.url))
    }

    const shopify = new ShopifyClient({ shopName: shop, accessToken: '' })
    const { access_token, scope } = await shopify.exchangeCodeForToken(code)

    await syncService.saveIntegration({
      user_id: user.id,
      platform: 'shopify',
      store_name: shop,
      store_url: `https://${shop}.myshopify.com`,
      access_token,
      scope,
      is_active: true,
    })

    return NextResponse.redirect(new URL('/settings/integrations?success=shopify_connected', req.url))
  } catch (error) {
    console.error('Shopify OAuth error:', error)
    return NextResponse.redirect(new URL('/settings/integrations?error=connection_failed', req.url))
  }
}
