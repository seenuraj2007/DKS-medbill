import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// Alert type defined locally

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const where: any = { tenantId: user.tenantId }
    
    // Optionally filter by read status
    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get('unread_only')
    if (unreadOnly === 'true') {
      where.isRead = false
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const formattedAlerts = alerts.map((alert: any) => ({
      id: alert.id,
      type: alert.type,
      message: alert.message,
      is_read: alert.isRead,
      read_at: alert.readAt,
      created_at: alert.createdAt,
      product_id: alert.productId
    }))

    return NextResponse.json(
      { alerts: formattedAlerts },
      {
        headers: {
          'Cache-Control': 'private, max-age=5, stale-while-revalidate=15'
        }
      }
    )
  } catch (error) {
    console.error('Get alerts error:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { alert_ids, mark_as_read } = body

    if (!alert_ids || !Array.isArray(alert_ids)) {
      return NextResponse.json({ error: 'Alert IDs are required' }, { status: 400 })
    }

    if (mark_as_read) {
      await prisma.alert.updateMany({
        where: {
          id: { in: alert_ids },
          tenantId: user.tenantId
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
    } else {
      await prisma.alert.updateMany({
        where: {
          id: { in: alert_ids },
          tenantId: user.tenantId
        },
        data: {
          isRead: false,
          readAt: null
        }
      })
    }

    return NextResponse.json({ message: 'Alerts updated successfully' })
  } catch (error) {
    console.error('Update alerts error:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
