import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const shop = searchParams.get('shop')

  if (!shop) {
    return NextResponse.redirect(new URL('/settings/integrations?error=shop_required', req.url))
  }

  const apiKey = process.env.SHOPIFY_API_KEY
  if (!apiKey) {
    return NextResponse.redirect(new URL('/settings/integrations?error=api_key_not_configured', req.url))
  }

  const scopes = [
    'read_products',
    'write_products',
    'read_orders',
    'write_orders',
    'read_inventory',
    'write_inventory',
  ].join(',')

  const redirectUri = `${process.env.APP_URL}/api/integrations/shopify/callback`
  const nonce = crypto.randomBytes(16).toString('hex')

  const installUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?` +
    `client_id=${apiKey}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${nonce}`

  return NextResponse.redirect(installUrl)
}
