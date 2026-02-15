import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const updateStockTakeSchema = z.object({
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

const countItemSchema = z.object({
  productId: z.string().uuid(),
  countedQuantity: z.number().int().min(0),
  batchId: z.string().uuid().optional(),
  serialNumbers: z.string().optional(), // JSON string of serial numbers
  notes: z.string().optional(),
});

// GET /api/stock-takes/[id] - Get stock take details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockTake: any = await (prisma as any).stockTake.findFirst({
      where: { id, tenantId },
      include: {
        location: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                unit: true,
                sellingPrice: true,
                unitCost: true,
              },
            },
          },
          orderBy: { product: { name: 'asc' } },
        },
      },
    });

    if (!stockTake) {
      return NextResponse.json({ error: 'Stock take not found' }, { status: 404 });
    }

    // Calculate summary
    const summary = {
      totalItems: stockTake.items.length,
      countedItems: stockTake.items.filter((i: any) => i.countedQuantity !== null).length,
      varianceItems: stockTake.items.filter((i: any) => 
        i.countedQuantity !== null && i.countedQuantity !== i.systemQuantity
      ).length,
      positiveVariance: stockTake.items
        .filter((i: any) => i.countedQuantity !== null && i.countedQuantity > i.systemQuantity)
        .reduce((sum: number, i: any) => sum + (i.countedQuantity! - i.systemQuantity), 0),
      negativeVariance: stockTake.items
        .filter((i: any) => i.countedQuantity !== null && i.countedQuantity < i.systemQuantity)
        .reduce((sum: number, i: any) => sum + (i.systemQuantity - i.countedQuantity!), 0),
    };

    // Add variance to each item
    const itemsWithVariance = stockTake.items.map((item: any) => ({
      ...item,
      variance: item.countedQuantity !== null ? item.countedQuantity - item.systemQuantity : null,
    }));

    return NextResponse.json({
      ...stockTake,
      items: itemsWithVariance,
      summary,
    });
  } catch (error) {
    console.error('Error fetching stock take:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/stock-takes/[id] - Update stock take status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    // Check permission
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateStockTakeSchema.parse(body);

    // Verify stock take exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing: any = await (prisma as any).stockTake.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Stock take not found' }, { status: 404 });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['PENDING_REVIEW', 'CANCELLED'],
      PENDING_REVIEW: ['COMPLETED', 'IN_PROGRESS', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (data.status && !validTransitions[existing.status]?.includes(data.status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${existing.status} to ${data.status}` },
        { status: 400 }
      );
    }

    // Update stock take
    const updateData: Record<string, any> = {
      notes: data.notes,
    };

    if (data.status === 'IN_PROGRESS' && !existing.startedAt) {
      updateData.status = data.status;
      updateData.startedAt = new Date();
    } else if (data.status === 'COMPLETED') {
      updateData.status = data.status;
      updateData.completedAt = new Date();
      updateData.supervisedBy = user.id;
    } else if (data.status) {
      updateData.status = data.status;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockTake: any = await (prisma as any).stockTake.update({
      where: { id },
      data: updateData,
      include: {
        location: true,
      },
    });

    return NextResponse.json({ stockTake });
  } catch (error) {
    console.error('Error updating stock take:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/stock-takes/[id] - Count item or complete stock take
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    // Check permission
    if (user.role !== 'OWNER' && user.role !== 'ADMIN' && user.role !== 'EDITOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify stock take exists and is in progress
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockTake: any = await (prisma as any).stockTake.findFirst({
      where: { id, tenantId },
    });

    if (!stockTake) {
      return NextResponse.json({ error: 'Stock take not found' }, { status: 404 });
    }

    if (stockTake.status !== 'IN_PROGRESS' && stockTake.status !== 'PENDING_REVIEW') {
      return NextResponse.json(
        { error: 'Stock take is not in progress' },
        { status: 400 }
      );
    }

    // Handle count item action
    if (body.action === 'countItem') {
      const data = countItemSchema.parse(body.data);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item: any = await (prisma as any).stockTakeItem.update({
        where: {
          stockTakeId_productId: {
            stockTakeId: id,
            productId: data.productId,
          },
        },
        data: {
          countedQuantity: data.countedQuantity,
          batchId: data.batchId,
          serialNumbers: data.serialNumbers,
          notes: data.notes,
          countedBy: user.id,
          countedAt: new Date(),
        },
      });

      // Update counted items count
      const countedItems = await (prisma as any).stockTakeItem.count({
        where: { stockTakeId: id, countedQuantity: { not: null } },
      });

      await (prisma as any).stockTake.update({
        where: { id },
        data: { countedItems },
      });

      return NextResponse.json({ item });
    }

    // Handle complete action - apply adjustments
    if (body.action === 'complete') {
      // Get all items with variance
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items: any[] = await (prisma as any).stockTakeItem.findMany({
        where: {
          stockTakeId: id,
          countedQuantity: { not: null },
        },
        include: {
          product: true,
        },
      });

      // Create stock adjustments for items with variance
      for (const item of items) {
        const variance = item.countedQuantity! - item.systemQuantity;
        if (variance !== 0) {
          // Update stock level
          await prisma.stockLevel.update({
            where: {
              tenantId_productId_locationId: {
                tenantId,
                productId: item.productId,
                locationId: stockTake.locationId,
              },
            },
            data: {
              quantity: item.countedQuantity!,
            },
          });

          // Create inventory event
          await prisma.inventoryEvent.create({
            data: {
              tenantId,
              type: 'ADJUSTMENT',
              productId: item.productId,
              locationId: stockTake.locationId,
              quantityDelta: variance,
              runningBalance: item.countedQuantity!,
              referenceType: 'STOCK_TAKE',
              referenceId: id,
              userId: user.id,
              notes: `Stock take adjustment: ${variance > 0 ? '+' : ''}${variance}`,
              metadata: {
                stockTakeReference: stockTake.referenceNumber,
                systemQuantity: item.systemQuantity,
                countedQuantity: item.countedQuantity,
              },
            },
          });

          // Create stock history
          await (prisma as any).stockHistory.create({
            data: {
              tenantId,
              productId: item.productId,
              locationId: stockTake.locationId,
              previousQuantity: item.systemQuantity,
              quantityChange: variance,
              newQuantity: item.countedQuantity!,
              changeType: 'ADJUSTMENT',
              referenceType: 'STOCK_TAKE',
              referenceId: id,
              userId: user.id,
              notes: `Stock take: ${stockTake.referenceNumber}`,
            },
          });
        }
      }

      // Update stock take status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const completed: any = await (prisma as any).stockTake.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          supervisedBy: user.id,
          varianceItems: items.filter((i: any) => i.countedQuantity !== i.systemQuantity).length,
        },
      });

      return NextResponse.json({
        message: 'Stock take completed successfully',
        stockTake: completed,
        adjustmentsApplied: items.filter((i: any) => i.countedQuantity !== i.systemQuantity).length,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing stock take:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/stock-takes/[id] - Cancel stock take
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    // Check permission
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    // Verify stock take exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockTake: any = await (prisma as any).stockTake.findFirst({
      where: { id, tenantId },
    });

    if (!stockTake) {
      return NextResponse.json({ error: 'Stock take not found' }, { status: 404 });
    }

    // Can only delete draft or cancelled stock takes
    if (stockTake.status !== 'DRAFT' && stockTake.status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot delete stock take in current status' },
        { status: 400 }
      );
    }

    // Delete stock take and items
    await (prisma as any).stockTake.delete({ where: { id } });

    return NextResponse.json({ message: 'Stock take deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock take:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
