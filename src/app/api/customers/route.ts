import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    const customers = await prisma.customer.findMany({
      where: {
        tenantId: user.tenantId,
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name, email, phone, address, city, state, pincode, gstNumber
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 })
    }

    // Check for duplicate email within tenant
    if (email) {
      const existing = await prisma.customer.findUnique({
        where: {
          tenantId_email: {
            tenantId: user.tenantId,
            email: email
          }
        }
      })
      
      if (existing) {
        return NextResponse.json({ 
          error: 'Customer with this email already exists' 
        }, { status: 409 })
      }
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId: user.tenantId,
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        gstNumber: gstNumber || null
      }
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const body = await req.json()
    const {
      name, email, phone, address, city, state, pincode, gstNumber, isActive
    } = body

    // Check if customer exists and belongs to tenant
    const existing = await prisma.customer.findFirst({
      where: { id, tenantId: user.tenantId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check for duplicate email if changing email
    if (email && email !== existing.email) {
      const duplicate = await prisma.customer.findUnique({
        where: {
          tenantId_email: {
            tenantId: user.tenantId,
            email: email
          }
        }
      })
      
      if (duplicate) {
        return NextResponse.json({ 
          error: 'Customer with this email already exists' 
        }, { status: 409 })
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(city !== undefined && { city: city || null }),
        ...(state !== undefined && { state: state || null }),
        ...(pincode !== undefined && { pincode: pincode || null }),
        ...(gstNumber !== undefined && { gstNumber: gstNumber || null }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    // Soft delete by setting isActive to false
    const customer = await prisma.customer.updateMany({
      where: { id, tenantId: user.tenantId },
      data: { isActive: false }
    })

    if (customer.count === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
