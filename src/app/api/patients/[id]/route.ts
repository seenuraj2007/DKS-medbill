import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/patients/[id] - Get single patient
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const patient = await prisma.patient.findFirst({
      where: {
        id,
        tenantId: user.tenantId
      },
      include: {
        prescriptions: {
          include: {
            prescriptionItems: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Get patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const {
      name, phone, email, date_of_birth, gender,
      address, city, state, pincode,
      allergies, chronic_conditions,
      emergency_contact, emergency_phone
    } = body

    const patient = await prisma.patient.updateMany({
      where: {
        id,
        tenantId: user.tenantId
      },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        dateOfBirth: date_of_birth ? new Date(date_of_birth) : null,
        gender: gender || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        allergies: allergies || null,
        chronicConditions: chronic_conditions || null,
        emergencyContact: emergency_contact || null,
        emergencyPhone: emergency_phone || null
      }
    })

    if (patient.count === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/patients/[id] - Delete patient
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const patient = await prisma.patient.deleteMany({
      where: {
        id,
        tenantId: user.tenantId
      }
    })

    if (patient.count === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete patient error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
