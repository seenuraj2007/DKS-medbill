import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, requireAuth } from '@/lib/auth'
import { PermissionsService } from '@/lib/permissions'
import { getOrganizationSubscription } from '@/lib/subscription'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// GET /api/team - List team members
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const members = await prisma.member.findMany({
      where: { tenantId: user.tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const team = members.map((m: any) => ({
      id: m.user.id,
      email: m.user.email,
      full_name: m.user.name,
      role: m.role,
      status: m.status,
      created_at: m.createdAt
    }))

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/team - Create team member directly
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owner can create users
    if (!PermissionsService.isOwner(user)) {
      return NextResponse.json({ error: 'Only owners can create users' }, { status: 403 })
    }

    const body = await req.json()
    const { email, password, full_name, role } = body

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 })
    }

    const validRoles = ['ADMIN', 'EDITOR', 'VIEWER', 'MEMBER']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (!user.tenantId) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    // Check subscription and team member limit
    const subscription = await getOrganizationSubscription(user.tenantId)
    const maxTeamMembers = subscription?.plan?.max_team_members || 3

    if (subscription && (subscription.status === 'expired' || subscription.status === 'cancelled')) {
      return NextResponse.json({ error: 'Subscription is not active' }, { status: 403 })
    }

    const memberCount = await prisma.member.count({
      where: { tenantId: user.tenantId }
    })

    console.log('Team member limit check:', {
      count: memberCount,
      maxLimit: maxTeamMembers,
      subscriptionStatus: subscription?.status,
      planName: subscription?.plan?.display_name || 'Free',
      planType: subscription?.plan?.name || 'free'
    })

    if (maxTeamMembers !== -1 && memberCount >= maxTeamMembers) {
      console.log('Blocking team member creation - limit reached')
      return NextResponse.json({
        error: 'Team member limit reached',
        limit: maxTeamMembers,
        current: memberCount,
        upgradeUrl: '/subscription'
      }, { status: 403 })
    }

    // Check if user already exists in the tenant
    const existingMember = await prisma.member.findFirst({
      where: {
        tenantId: user.tenantId,
        user: { email }
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: 'User already exists in organization' }, { status: 400 })
    }

    // Check if user exists in the system
    let targetUser = await prisma.user.findUnique({
      where: { email }
    })

    if (targetUser) {
      // User exists, add them to the tenant as a member
      await prisma.member.create({
        data: {
          tenantId: user.tenantId,
          userId: targetUser.id,
          role: role as any,
          status: 'ACTIVE',
          invitedBy: user.id
        }
      })
    } else {
      // User doesn't exist, create them with password
      const hashedPassword = await bcrypt.hash(password, 10)

      targetUser = await prisma.user.create({
        data: {
          email,
          name: full_name || null,
          passwordHash: hashedPassword
        }
      })

      await prisma.member.create({
        data: {
          tenantId: user.tenantId,
          userId: targetUser.id,
          role: role as any,
          status: 'INVITED',
          invitedBy: user.id
        }
      })
    }

    // Fetch the created member
    const member = await prisma.member.findFirst({
      where: {
        tenantId: user.tenantId,
        userId: targetUser.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      user: {
        id: member?.user.id,
        email: member?.user.email,
        full_name: member?.user.name,
        role: member?.role,
        status: member?.status,
        created_at: member?.createdAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
