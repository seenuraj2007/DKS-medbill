import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    if (error) {
      console.error('Get suppliers error:', error)
      return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
    }

    const suppliersWithCount = await Promise.all(
      (suppliers || []).map(async (supplier) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('supplier_id', supplier.id)
          .eq('user_id', user.id)
        return { ...supplier, total_products: count || 0 }
      })
    )

    return NextResponse.json({ suppliers: suppliersWithCount })
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

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert({
        user_id: user.id,
        name,
        contact_person: contact_person || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        notes: notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Create supplier error:', error)
      return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
    }

    return NextResponse.json({ supplier }, { status: 201 })
  } catch (error) {
    console.error('Create supplier error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
