import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription } from '@/lib/subscription'

interface Location {
  id: string
  user_id: string
  name: string
  address?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  is_primary?: boolean
  created_at?: string
  product_stock?: Array<{ count: number }>
}

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

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()

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

    const formattedLocations = (locations || []).map((loc: Location) => ({
      ...loc,
      total_products: loc.product_stock?.length || 0
    }))

    return NextResponse.json({ locations: formattedLocations }, {
      headers: {
        'Cache-Control': 'private, max-age=10, stale-while-revalidate=60'
      }
    })
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

    const supabase = createServiceClient()

    const body = await req.json()
    const { name, address, city, state, zip, country, is_primary } = body

    if (!name) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 })
    }

    let location: Location | null = null

    // Check subscription limits for all users (with or without organization_id)
    const subscription = await getOrganizationSubscription(user.organization_id || '')
    const maxLocations = subscription?.plan?.max_locations || 1 // Default to 1 for free plan

    // Check if subscription is active
    if (subscription && (subscription.status === 'expired' || subscription.status === 'cancelled')) {
      return NextResponse.json({ error: 'Subscription is not active' }, { status: 403 })
    }

    // Count current locations
    const { count, error: countError } = await supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error counting locations:', countError)
    }

    console.log('Location limit check:', { 
      count, 
      maxLimit: maxLocations,
      subscriptionStatus: subscription?.status,
      planName: subscription?.plan?.display_name || 'Free',
      planType: subscription?.plan?.name || 'free',
      hasOrg: !!user.organization_id
    })

    // Enforce limit (unless unlimited: -1)
    if (maxLocations !== -1 && count !== null && count >= maxLocations) {
      console.log('Blocking location creation - limit reached')
      return NextResponse.json({
        error: 'Location limit reached',
        limit: maxLocations,
        current: count,
        upgradeUrl: '/subscription'
      }, { status: 403 })
    }

    // Create the location
    const { data, error: insertError } = await supabase
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

    location = data

    return NextResponse.json({ location }, { status: 201 })
  } catch (error) {
    console.error('POST locations error:', error)
    return NextResponse.json({ error: 'Failed to save location' }, { status: 500 })
  }
}
