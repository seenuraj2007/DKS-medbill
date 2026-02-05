import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getCurrentTenantId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request as any)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getCurrentTenantId(request as any)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.whatsAppSettings.findUnique({
      where: { tenantId },
    })

    return NextResponse.json({
      enabled: settings?.enabled || false,
      phoneNumber: settings?.phoneNumber || null,
      notifications: {
        lowStock: settings?.notifyLowStock ?? true,
        outOfStock: settings?.notifyOutOfStock ?? true,
        purchaseOrders: settings?.notifyPurchaseOrders ?? true,
        dailySummary: settings?.notifyDailySummary ?? false,
      },
      language: settings?.language || 'en',
    })
  } catch (error) {
    console.error('WhatsApp settings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request as any)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getCurrentTenantId(request as any)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { enabled, phoneNumber, notifications, language } = body

    // Validate phone number
    if (phoneNumber && !/^\+?[\d\s-]{10,}$/.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    const settings = await prisma.whatsAppSettings.upsert({
      where: { tenantId },
      update: {
        enabled,
        phoneNumber: phoneNumber || null,
        notifyLowStock: notifications?.lowStock ?? true,
        notifyOutOfStock: notifications?.outOfStock ?? true,
        notifyPurchaseOrders: notifications?.purchaseOrders ?? true,
        notifyDailySummary: notifications?.dailySummary ?? false,
        language: language || 'en',
      },
      create: {
        tenantId,
        enabled,
        phoneNumber: phoneNumber || null,
        notifyLowStock: notifications?.lowStock ?? true,
        notifyOutOfStock: notifications?.outOfStock ?? true,
        notifyPurchaseOrders: notifications?.purchaseOrders ?? true,
        notifyDailySummary: notifications?.dailySummary ?? false,
        language: language || 'en',
      },
    })

    return NextResponse.json({
      success: true,
      settings: {
        enabled: settings.enabled,
        phoneNumber: settings.phoneNumber,
        notifications: {
          lowStock: settings.notifyLowStock,
          outOfStock: settings.notifyOutOfStock,
          purchaseOrders: settings.notifyPurchaseOrders,
          dailySummary: settings.notifyDailySummary,
        },
        language: settings.language,
      },
    })
  } catch (error) {
    console.error('WhatsApp settings update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
