import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { getOrganizationSubscription } from '@/lib/subscription'
import { v4 as uuidv4 } from 'uuid'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim() + '-' + uuidv4().split('-')[0]
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has a tenant via membership
    const existingMember = await prisma.member.findFirst({
      where: { userId: user.id }
    })

    // If no membership, create one for this user
    if (!existingMember) {
      const orgName = user.displayName ? `${user.displayName}'s Organization` : 'My Organization'
      const orgSlug = slugify(orgName)

      const newOrg = await prisma.tenant.create({
        data: {
          name: orgName,
          slug: orgSlug,
          ownerId: user.id,
        }
      })

      // Create default location for the organization
      await prisma.location.create({
        data: {
          name: 'Main Warehouse',
          tenantId: newOrg.id,
          type: 'WAREHOUSE',
          isPrimary: true,
          isActive: true,
        }
      })

      // Create membership for the user
      await prisma.member.create({
        data: {
          tenantId: newOrg.id,
          userId: user.id,
          role: 'OWNER',
          status: 'ACTIVE',
        }
      })
    }

    // Get user's tenant/membership
    const member = existingMember || await prisma.member.findFirst({
      where: { userId: user.id }
    })

    const tenantId = member?.tenantId

    if (!tenantId) {
      return NextResponse.json({
        totalProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        unreadAlerts: 0,
        lowStockItems: [],
        subscription: null,
        usage: {
          teamMembers: 0,
          products: 0,
          locations: 0
        }
      })
    }

    // Use Promise.all for parallel queries with optimized selections
    const [
      totalProducts,
      alertsCount,
      teamMembersCount,
      locationsCount,
      stockStats
    ] = await Promise.all([
      // Optimized count query
      prisma.product.count({
        where: { tenantId, isActive: true, deletedAt: null }
      }),
      
      // Unread alerts count
      prisma.alert.count({
        where: { tenantId, isRead: false }
      }),
      
      // Team members count
      prisma.member.count({
        where: { tenantId }
      }),
      
      // Locations count
      prisma.location.count({
        where: { tenantId, isActive: true }
      }),
      
      // Optimized stock levels query - fetch only needed fields
      prisma.stockLevel.findMany({
        where: { 
          tenantId,
          product: { isActive: true, deletedAt: null }
        },
        select: {
          quantity: true,
          reorderPoint: true,
          product: {
            select: { 
              id: true, 
              name: true, 
              sku: true 
            }
          }
        },
        orderBy: { quantity: 'asc' },
        take: 100
      })
    ])

    // Calculate stock stats
    let lowStockProductsCount = 0
    let outOfStockProductsCount = 0
    const lowStockItems = []

    for (const sl of stockStats) {
      if (sl.quantity === 0) {
        outOfStockProductsCount++
      } else if (sl.quantity <= sl.reorderPoint) {
        lowStockProductsCount++
        if (lowStockItems.length < 5) {
          lowStockItems.push({
            id: sl.product.id,
            name: sl.product.name,
            sku: sl.product.sku,
            currentQuantity: sl.quantity,
            reorderPoint: sl.reorderPoint
          })
        }
      }
    }

    // Get subscription info
    const orgSubscription = await getOrganizationSubscription(tenantId)
    const subscription = orgSubscription ? {
      status: orgSubscription.status,
      trialEndDate: orgSubscription.trial_end_date,
      plan: orgSubscription.plan ? {
        name: orgSubscription.plan.name,
        displayName: orgSubscription.plan.display_name,
        maxTeamMembers: orgSubscription.plan.max_team_members,
        maxProducts: orgSubscription.plan.max_products,
        maxLocations: orgSubscription.plan.max_locations,
      } : undefined
    } : null

    return NextResponse.json({
      totalProducts: totalProducts || 0,
      lowStockProducts: lowStockProductsCount,
      outOfStockProducts: outOfStockProductsCount,
      unreadAlerts: alertsCount || 0,
      lowStockItems: lowStockItems || [],
      subscription,
      usage: {
        teamMembers: teamMembersCount,
        products: totalProducts || 0,
        locations: locationsCount
      }
    }, {
      headers: {
        'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
      }
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
