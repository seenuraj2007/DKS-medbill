import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If no organization, return error (tenant setup should have created it)
    if (!user.tenantId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const owner = await prisma.member.findFirst({
      where: { tenantId: user.tenantId, role: 'OWNER' },
      include: { user: true }
    })

    const memberCount = await prisma.member.count({
      where: { tenantId: user.tenantId }
    })

    // Parse tenant settings for business details
    const settings = tenant.settings as any || {}

    return NextResponse.json({
      organization: {
        id: tenant.id,
        name: tenant.name,
        address: settings.address || null,
        city: settings.city || null,
        state: settings.state || null,
        pincode: settings.pincode || null,
        gstNumber: settings.gstNumber || null,
        phone: settings.phone || null,
        email: settings.email || null,
        upiId: settings.upiId || null,
        created_at: tenant.createdAt,
        updated_at: tenant.updatedAt
      },
      owner: owner ? {
        id: owner.user.id,
        email: owner.user.email,
        full_name: owner.user.name
      } : null,
      memberCount
    })
  } catch (error) {
    console.error('Get organization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, upiId, address, city, state, pincode, gstNumber, phone, email } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Organization name must be at least 2 characters' }, { status: 400 })
    }

    if (upiId && !upiId.includes('@')) {
      return NextResponse.json({ error: 'Invalid UPI ID format. Use format like name@upi' }, { status: 400 })
    }

    const currentOrg = await prisma.tenant.findUnique({
      where: { id: user.tenantId }
    })

    if (!currentOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const currentSettings = (currentOrg.settings as any) || {}
    const updatedSettings = {
      ...currentSettings,
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(pincode !== undefined && { pincode }),
      ...(gstNumber !== undefined && { gstNumber }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(upiId !== undefined && { upiId })
    }

    const updatedOrg = await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { 
        name: name.trim(),
        settings: updatedSettings
      }
    })

    return NextResponse.json({ 
      organization: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        created_at: updatedOrg.createdAt,
        updated_at: updatedOrg.updatedAt
      }
    })
  } catch (error) {
    console.error('Update organization error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
