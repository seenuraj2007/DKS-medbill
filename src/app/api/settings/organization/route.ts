import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'
import { supabaseAdmin } from '@/lib/serverSupabase'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If no organization, check if they have products and auto-create one
    if (!user.organization_id) {
      // Check if user has any products
      const { count: productCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (productCount && productCount > 0) {
        // User has products but no organization - auto-create one
        const orgName = user.full_name ? `${user.full_name}'s Organization` : 'My Organization'

        const { data: newOrg, error: orgError } = await (supabaseAdmin || supabase)
          .from('organizations')
          .insert({ name: orgName })
          .select()
          .single()

        if (orgError) {
          console.error('Error creating organization:', orgError)
        } else if (newOrg) {
          // Update user with organization_id
          const { error: updateError } = await (supabaseAdmin || supabase)
            .from('users')
            .update({ organization_id: newOrg.id })
            .eq('id', user.id)

          if (updateError) {
            console.error('Error updating user organization:', updateError)
          }

          // Create trial subscription for the new organization
          const { data: freePlan } = await (supabaseAdmin || supabase)
            .from('subscription_plans')
            .select('id')
            .eq('name', 'free')
            .single()

          if (freePlan) {
            const trialEndDate = new Date()
            trialEndDate.setDate(trialEndDate.getDate() + 14)

            await (supabaseAdmin || supabase)
              .from('subscriptions')
              .insert({
                organization_id: newOrg.id,
                plan_id: freePlan.id,
                status: 'trial',
                trial_end_date: trialEndDate.toISOString()
              })
          }

          // Return success with the new organization
          const { data: ownerData } = await supabase
            .from('users')
            .select('id, email, full_name')
            .eq('organization_id', newOrg.id)
            .eq('role', 'owner')
            .single()

          const { count: memberCount } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', newOrg.id)

          return NextResponse.json({
            organization: newOrg,
            owner: ownerData,
            memberCount: memberCount || 0,
            autoCreated: true
          })
        }
      }

      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
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

    // Allow any team member to view, but only owners can update
    // if (!PermissionsService.isOwner(user)) {
    //   return NextResponse.json({ error: 'Only owners can update organization' }, { status: 403 })
    // }

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
