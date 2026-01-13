import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

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

    return NextResponse.json({
      totalProducts: totalProducts.count,
      lowStockProducts: lowStockProducts.count,
      outOfStockProducts: outOfStockProducts.count,
      unreadAlerts: unreadAlerts.count,
      lowStockItems
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
