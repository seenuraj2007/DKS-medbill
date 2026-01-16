import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: org, error } = await supabase
      .from('organizations')
      .select('id, name, created_at, updated_at')
      .eq('id', user.organization_id)
      .single()

    if (error || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { data: ownerData } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('organization_id', user.organization_id)
      .eq('role', 'owner')
      .single()

    const { count: memberCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', user.organization_id)

    return NextResponse.json({
      organization: org,
      owner: ownerData,
      memberCount: memberCount || 0
    })
  } catch (error) {
    console.error('Get organization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!PermissionsService.isOwner(user)) {
      return NextResponse.json({ error: 'Only owners can update organization' }, { status: 403 })
    }

    const body = await req.json()
    const { name } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Organization name must be at least 2 characters' }, { status: 400 })
    }

    const { data: currentOrg, error: currentError } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', user.organization_id)
      .single()

    if (currentError || !currentOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update({ name: name.trim() })
      .eq('id', user.organization_id)
      .select('id, name, created_at, updated_at')
      .single()

    if (updateError) {
      console.error('Update organization error:', updateError)
      return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
    }

    return NextResponse.json({ organization: updatedOrg })
  } catch (error) {
    console.error('Update organization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
