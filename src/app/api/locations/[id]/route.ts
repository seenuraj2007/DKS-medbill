import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromRequest } from '@/lib/auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function createServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

    const { data: location, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const { count } = await supabase
      .from('product_stock')
      .select('id', { count: 'exact', head: true })
      .eq('location_id', id)

    return NextResponse.json({ location: { ...location, total_products: count || 0 } })
  } catch (error) {
    console.error('Get location error:', error)
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
    const supabase = createServiceClient()

    const body = await req.json()
    const { name, address, city, state, zip, country, is_primary } = body

    if (!name) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 })
    }

    const { data: existing, error: existingError } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (is_primary) {
      await supabase
        .from('locations')
        .update({ is_primary: false })
        .eq('user_id', user.id)
    }

    const { data: location, error } = await supabase
      .from('locations')
      .update({
        name,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        country: country || null,
        is_primary: is_primary || false
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Update location error:', error)
      if (error.message.includes('duplicate key')) {
        return NextResponse.json({ error: 'Location name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
    }

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Update location error:', error)
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
    const supabase = createServiceClient()

    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (locationError || !location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    if (location.is_primary) {
      const { count } = await supabase
        .from('locations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('id', id)

      if (count === 0) {
        return NextResponse.json({ error: 'Cannot delete only location' }, { status: 400 })
      }
    }

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete location error:', error)
      return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete location error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
