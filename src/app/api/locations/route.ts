import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription, hasReachedLimit } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const locations = db.prepare(`
      SELECT 
        l.*,
        COUNT(ps.id) as total_products
      FROM locations l
      LEFT JOIN product_stock ps ON l.id = ps.location_id
      WHERE l.user_id = ?
      GROUP BY l.id
      ORDER BY l.is_primary DESC, l.name ASC
    `).all(user.id)

    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Get locations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, address, city, state, zip, country, is_primary } = body

    if (!name) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 })
    }

    // Check subscription limits
    if (user.organization_id) {
      const subscription = getOrganizationSubscription(user.organization_id)
      if (subscription && subscription.status !== 'trial') {
        if (subscription.status === 'expired' || subscription.status === 'cancelled') {
          return NextResponse.json({ error: 'Subscription is not active' }, { status: 403 })
        }

        const currentLocationCount = db.prepare('SELECT COUNT(*) as count FROM locations WHERE user_id IN (SELECT id FROM users WHERE organization_id = ?)').get(user.organization_id) as { count: number }

        if (hasReachedLimit(subscription, currentLocationCount.count, 'locations')) {
          return NextResponse.json({
            error: 'Location limit reached',
            limit: subscription.plan?.max_locations,
            current: currentLocationCount.count,
            upgradeUrl: '/subscription'
          }, { status: 403 })
        }
      }
    }

    if (is_primary) {
      db.prepare('UPDATE locations SET is_primary = 0 WHERE user_id = ?').run(user.id)
    }

    const result = db.prepare(`
      INSERT INTO locations (user_id, name, address, city, state, zip, country, is_primary)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, name, address || null, city || null, state || null, zip || null, country || null, is_primary ? 1 : 0)

    const location = db.prepare('SELECT * FROM locations WHERE id = ?').get(result.lastInsertRowid)

    return NextResponse.json({ location }, { status: 201 })
  } catch (error) {
    console.error('Create location error:', error)
    if ((error as any).code === 'SQLITE_CONSTRAINT') {
      return NextResponse.json({ error: 'Location name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
