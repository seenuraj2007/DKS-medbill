import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/serverSupabase'

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {} as Record<string, any>
    }

    if (!supabaseAdmin) {
      health.checks.database = { status: 'skipped', message: 'Admin client not configured' }
      const response = NextResponse.json(health, { status: 200 })
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('X-Health-Check', 'true')
      return response
    }

    try {
      const { error } = await supabaseAdmin.from('users').select('id').limit(1)
      health.checks.database = error ? { status: 'error', message: error.message } : { status: 'healthy' }
    } catch (dbError: any) {
      health.checks.database = { status: 'error', message: dbError.message }
      health.status = 'degraded'
    }

    const response = NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503
    })

    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('X-Health-Check', 'true')

    return response
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 })
  }
}