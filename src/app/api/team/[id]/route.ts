import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'

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

// PATCH /api/team/[id] - Update team member role
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const memberId = resolvedParams.id
    const supabase = createServiceClient()

    const body = await req.json()
    const { role } = body

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 })
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Only owner can update team member roles
    if (!PermissionsService.isOwner(user)) {
      return NextResponse.json({ error: 'Only owners can update roles' }, { status: 403 })
    }

    // Get team member to update
    const { data: targetMember, error } = await supabase
      .from('users')
      .select('id, role, email, organization_id')
      .eq('id', memberId)
      .single()

    if (error || !targetMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Verify team member belongs to same organization
    if (targetMember.organization_id !== user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Owner cannot change their own role
    if (targetMember.id === user.id && user.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
    }

    // Only owner can change owner role
    if (role === 'owner' && user.role !== 'owner') {
      return NextResponse.json({ error: 'Only owner can assign owner role' }, { status: 403 })
    }

    // Update role
    const { error: updateError } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', memberId)

    if (updateError) {
      console.error('Error updating team member role:', updateError)
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/team/[id] - Remove team member
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const memberId = resolvedParams.id
    const supabase = createServiceClient()

    // Only owner can remove team members
    if (!PermissionsService.isOwner(user)) {
      return NextResponse.json({ error: 'Only owners can remove team members' }, { status: 403 })
    }

    // Get team member to remove
    const { data: targetMember, error } = await supabase
      .from('users')
      .select('id, role, email, organization_id')
      .eq('id', memberId)
      .single()

    if (error || !targetMember) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Verify team member belongs to same organization
    if (targetMember.organization_id !== user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Owner cannot remove themselves
    if (targetMember.id === user.id && user.role === 'owner') {
      return NextResponse.json({ error: 'Owner cannot leave organization' }, { status: 400 })
    }

    // If removing owner, require organization transfer
    if (targetMember.role === 'owner') {
      return NextResponse.json({ error: 'Transfer ownership before removing' }, { status: 400 })
    }

    // Remove team member (set organization_id to null, keep user account)
    const { error: deleteError } = await supabase
      .from('users')
      .update({ organization_id: null as unknown as string, role: null, updated_at: new Date().toISOString() })
      .eq('id', memberId)

    if (deleteError) {
      console.error('Error removing team member:', deleteError)
      return NextResponse.json({ error: 'Failed to remove team member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
