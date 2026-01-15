import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE user_id = ?').get(user.id) as { count: number }

    const lowStockProducts = db.prepare(`
      SELECT COUNT(*) as count FROM products
      WHERE user_id = ? AND current_quantity <= reorder_point AND current_quantity > 0
    `).get(user.id) as { count: number }

    const outOfStockProducts = db.prepare(`
      SELECT COUNT(*) as count FROM products
      WHERE user_id = ? AND current_quantity = 0
    `).get(user.id) as { count: number }

    const unreadAlerts = db.prepare(`
      SELECT COUNT(*) as count FROM alerts
      WHERE user_id = ? AND is_read = 0
    `).get(user.id) as { count: number }

    const lowStockItems = db.prepare(`
      SELECT * FROM products
      WHERE user_id = ? AND current_quantity <= reorder_point
      ORDER BY (current_quantity / CAST(reorder_point AS FLOAT)) ASC
      LIMIT 5
    `).all(user.id) as any[]

    let subscription = null
    if (user.organization_id) {
      const orgSubscription = getOrganizationSubscription(user.organization_id)
      if (orgSubscription) {
        subscription = {
          status: orgSubscription.status,
          trial_end_date: orgSubscription.trial_end_date,
          plan: orgSubscription.plan ? {
            name: orgSubscription.plan.name,
            display_name: orgSubscription.plan.display_name,
            max_team_members: orgSubscription.plan.max_team_members,
            max_products: orgSubscription.plan.max_products,
            max_locations: orgSubscription.plan.max_locations
          } : undefined
        }
      }
    }

    return NextResponse.json({
      totalProducts: totalProducts.count,
      lowStockProducts: lowStockProducts.count,
      outOfStockProducts: outOfStockProducts.count,
      unreadAlerts: unreadAlerts.count,
      lowStockItems,
      subscription
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
