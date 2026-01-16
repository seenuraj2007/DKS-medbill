import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      name, 
      sku, 
      barcode,
      category, 
      current_quantity, 
      reorder_point, 
      supplier_id,
      supplier_name, 
      supplier_email, 
      supplier_phone,
      unit_cost,
      selling_price,
      unit,
      image_url
    } = body

    const updateData: Record<string, unknown> = {}

    if (name !== undefined) updateData.name = name
    if (sku !== undefined) updateData.sku = sku || null
    if (barcode !== undefined) updateData.barcode = barcode || null
    if (category !== undefined) updateData.category = category || null
    if (current_quantity !== undefined) updateData.current_quantity = current_quantity
    if (reorder_point !== undefined) updateData.reorder_point = reorder_point
    if (supplier_id !== undefined) updateData.supplier_id = supplier_id || null
    if (supplier_name !== undefined) updateData.supplier_name = supplier_name || null
    if (supplier_email !== undefined) updateData.supplier_email = supplier_email || null
    if (supplier_phone !== undefined) updateData.supplier_phone = supplier_phone || null
    if (unit_cost !== undefined) updateData.unit_cost = unit_cost
    if (selling_price !== undefined) updateData.selling_price = selling_price
    if (unit !== undefined) updateData.unit = unit
    if (image_url !== undefined) updateData.image_url = image_url || null

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !product) {
      console.error('Update product error:', error)
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete product error:', error)
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
