import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/batches/expiry-alerts - Get batches expiring soon
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90', 10);

    // Get current date and future date
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    // Get batches expiring within the specified days - using any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expiringBatches: any[] = await (prisma as any).batch.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        expiryDate: {
          gte: now,
          lte: futureDate,
        },
        quantity: { gt: 0 },
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
            sellingPrice: true,
          },
        },
        stockLevel: {
          select: {
            location: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    // Get already expired batches with stock - using any type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expiredBatches: any[] = await (prisma as any).batch.findMany({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'EXPIRED'] },
        expiryDate: { lt: now },
        quantity: { gt: 0 },
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
            sellingPrice: true,
          },
        },
        stockLevel: {
          select: {
            location: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    // Calculate summary
    const summary = {
      expiringIn30Days: expiringBatches.filter(b => {
        const daysUntil = Math.ceil(
          (new Date(b.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntil <= 30;
      }).length,
      expiringIn60Days: expiringBatches.filter(b => {
        const daysUntil = Math.ceil(
          (new Date(b.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntil > 30 && daysUntil <= 60;
      }).length,
      expiringIn90Days: expiringBatches.filter(b => {
        const daysUntil = Math.ceil(
          (new Date(b.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntil > 60 && daysUntil <= 90;
      }).length,
      expired: expiredBatches.length,
      totalValueAtRisk: [...expiringBatches, ...expiredBatches].reduce((sum: number, batch: any) => {
        const value = Number(batch.unitCost || batch.product.sellingPrice) * batch.quantity;
        return sum + value;
      }, 0),
    };

    // Add computed fields to batches
    const processedExpiring = expiringBatches.map((batch: any) => ({
      ...batch,
      daysUntilExpiry: Math.ceil(
        (new Date(batch.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      ),
      value: Number(batch.unitCost || batch.product.sellingPrice) * batch.quantity,
    }));

    const processedExpired = expiredBatches.map((batch: any) => ({
      ...batch,
      daysSinceExpiry: Math.ceil(
        (now.getTime() - new Date(batch.expiryDate!).getTime()) / (1000 * 60 * 60 * 24)
      ),
      value: Number(batch.unitCost || batch.product.sellingPrice) * batch.quantity,
    }));

    return NextResponse.json({
      expiringBatches: processedExpiring,
      expiredBatches: processedExpired,
      summary,
    });
  } catch (error) {
    console.error('Error fetching expiry alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
