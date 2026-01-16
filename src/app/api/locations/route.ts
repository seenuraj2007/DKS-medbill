import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription, hasReachedLimit } from '@/lib/subscription'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: locations, error } = await supabase
      .from('locations')
      .select(`
        *,
        product_stock (count)
      `)
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      console.error('Get locations error:', error)
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 })
    }

    const formattedLocations = (locations || []).map(loc => ({
      ...loc,
      total_products: loc.product_stock?.length || 0
    }))

    return NextResponse.json({ locations: formattedLocations })
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

    if (user.organization_id) {
      const subscription = await getOrganizationSubscription(user.organization_id)
      if (subscription && subscription.status !== 'trial') {
        if (subscription.status === 'expired' || subscription.status === 'cancelled') {
          return NextResponse.json({ error: 'Subscription is not active' }, { status: 403 })
        }

        const { count, error: countError } = await supabase
          .from('locations')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if (countError) {
          console.error('Error counting locations:', countError)
        }

        if (count && hasReachedLimit(subscription, count, 'locations')) {
          return NextResponse.json({
            error: 'Location limit reached',
            limit: subscription.plan?.max_locations,
            current: count,
            upgradeUrl: '/subscription'
          }, { status: 403 })
        }
      }
    }

    if (is_primary) {
      await supabase
        .from('locations')
        .update({ is_primary: false })
        .eq('user_id', user.id)
    }

    const { data: location, error: insertError } = await supabase
      .from('locations')
      .insert({
        user_id: user.id,
        name,
        address: address || null,
        city: city || null,
        state: state || null,
        zip: zip || null,
        country: country || null,
        is_primary: is_primary || false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Create location error:', insertError)
      if (insertError.message.includes('duplicate key')) {
        return NextResponse.json({ error: 'Location name already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to create location' }, { status: 500 })
    }

    return NextResponse.json({ location }, { status: 201 })
  } catch (error) {
    console.error('Create location error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
