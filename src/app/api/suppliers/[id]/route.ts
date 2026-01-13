import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ? AND user_id = ?').get(id, user.id)
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE supplier_id = ? AND user_id = ?').get(id, user.id) as any

    return NextResponse.json({ supplier: { ...supplier, total_products: totalProducts?.count || 0 } })
  } catch (error) {
    console.error('Get supplier error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, contact_person, email, phone, address, notes } = body

    if (!name) {
      return NextResponse.json({ error: 'Supplier name is required' }, { status: 400 })
    }

    const existing = db.prepare('SELECT * FROM suppliers WHERE id = ? AND user_id = ?').get(id, user.id)
    if (!existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    db.prepare(`
      UPDATE suppliers
      SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(name, contact_person || null, email || null, phone || null, address || null, notes || null, id, user.id)

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id)

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error('Update supplier error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const supplier = db.prepare('SELECT * FROM suppliers WHERE id = ? AND user_id = ?').get(id, user.id)
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    db.prepare('DELETE FROM suppliers WHERE id = ? AND user_id = ?').run(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete supplier error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
