import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_id', id)
      .eq('user_id', user.id)

    return NextResponse.json({ supplier: { ...supplier, total_products: totalProducts || 0 } })
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

    const { data: existing, error: existingError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update({
        name,
        contact_person: contact_person || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Update supplier error:', error)
      return NextResponse.json({ error: 'Failed to update supplier' }, { status: 500 })
    }

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

    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (supplierError || !supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete supplier error:', error)
      return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete supplier error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
