import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { PermissionsService } from '@/lib/permissions';
import { z } from 'zod';

// Validation schema for updates
const updateBatchSchema = z.object({
  batchNumber: z.string().min(1).max(100).optional(),
  manufacturingDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  quantity: z.number().int().min(0).optional(),
  reservedQuantity: z.number().int().min(0).optional(),
  unitCost: z.number().min(0).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'RECALLED', 'QUARANTINE', 'DEPLETED']).optional(),
  supplierBatchRef: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/batches/[id] - Get batch details
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
    const batch: any = await (prisma as any).batch.findFirst({
      where: { id, tenantId },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            description: true,
            unit: true,
            sellingPrice: true,
          },
        },
        stockLevel: {
          select: {
            id: true,
            quantity: true,
            location: {
              select: { id: true, name: true, type: true },
            },
          },
        },
        serialNumbers: {
          where: { status: 'IN_STOCK' },
          select: { id: true, serialNumber: true, status: true },
          take: 50,
        },
        _count: {
          select: { serialNumbers: true },
        },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Calculate days until expiry
    let daysUntilExpiry: number | null = null;
    let isExpiringSoon = false;
    if (batch.expiryDate) {
      const now = new Date();
      const expiry = new Date(batch.expiryDate);
      daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      isExpiringSoon = daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    }

    return NextResponse.json({
      ...batch,
      daysUntilExpiry,
      isExpiringSoon,
      availableQuantity: batch.quantity - batch.reservedQuantity,
    });
  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/batches/[id] - Update batch
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

    // Check permission - only OWNER and ADMIN can update
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateBatchSchema.parse(body);

    // Verify batch exists and belongs to tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingBatch: any = await (prisma as any).batch.findFirst({
      where: { id, tenantId },
    });

    if (!existingBatch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Check for duplicate batch number if changing
    if (data.batchNumber && data.batchNumber !== existingBatch.batchNumber) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const duplicate: any = await (prisma as any).batch.findFirst({
        where: {
          tenantId,
          productId: existingBatch.productId,
          batchNumber: data.batchNumber,
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Batch number already exists for this product' },
          { status: 409 }
        );
      }
    }

    // Update batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const batch: any = await (prisma as any).batch.update({
      where: { id },
      data: {
        batchNumber: data.batchNumber,
        manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : data.manufacturingDate === null ? null : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : data.expiryDate === null ? null : undefined,
        quantity: data.quantity,
        reservedQuantity: data.reservedQuantity,
        unitCost: data.unitCost,
        status: data.status,
        supplierBatchRef: data.supplierBatchRef,
        notes: data.notes,
      },
      include: {
        product: { select: { id: true, sku: true, name: true } },
      },
    });

    return NextResponse.json({ batch });
  } catch (error) {
    console.error('Error updating batch:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/batches/[id] - Delete batch (only if no stock)
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

    // Check permission - only OWNER and ADMIN can delete
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;

    // Verify batch exists and belongs to tenant
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const batch: any = await (prisma as any).batch.findFirst({
      where: { id, tenantId },
      include: {
        _count: { select: { serialNumbers: true } },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Check if batch has stock
    if (batch.quantity > 0) {
      return NextResponse.json(
        { error: 'Cannot delete batch with remaining stock. Set quantity to 0 first.' },
        { status: 400 }
      );
    }

    // Check if batch has serial numbers
    if (batch._count.serialNumbers > 0) {
      return NextResponse.json(
        { error: 'Cannot delete batch with associated serial numbers' },
        { status: 400 }
      );
    }

    // Delete batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).batch.delete({ where: { id } });

    return NextResponse.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
