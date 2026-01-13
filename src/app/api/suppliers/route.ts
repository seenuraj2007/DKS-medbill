import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const suppliers = db.prepare(`
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as total_products
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      WHERE s.user_id = ?
      GROUP BY s.id
      ORDER BY s.name ASC
    `).all(user.id)

    return NextResponse.json({ suppliers })
  } catch (error) {
    console.error('Get suppliers error:', error)
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
    const { name, contact_person, email, phone, address, notes } = body

    if (!name) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 })
    }

    const result = db.prepare(`
      INSERT INTO suppliers (user_id, name, contact_person, email, phone, address, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(user.id, name, contact_person || null, email || null, phone || null, address || null, notes || null)

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(result.lastInsertRowid)

    return NextResponse.json({ supplier }, { status: 201 })
  } catch (error) {
    console.error('Create supplier error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
