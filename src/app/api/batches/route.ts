import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { PermissionsService } from '@/lib/permissions';
import { z } from 'zod';

// Validation schemas
const createBatchSchema = z.object({
  productId: z.string().uuid(),
  stockLevelId: z.string().uuid().optional(),
  batchNumber: z.string().min(1).max(100),
  manufacturingDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  quantity: z.number().int().min(0),
  unitCost: z.number().min(0).optional(),
  supplierId: z.string().optional(),
  supplierBatchRef: z.string().optional(),
  notes: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  productId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'RECALLED', 'QUARANTINE', 'DEPLETED']).optional(),
  expiringWithinDays: z.coerce.number().int().min(1).max(365).optional(),
  sortBy: z.enum(['batchNumber', 'expiryDate', 'quantity', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// GET /api/batches - List batches with filtering and pagination
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
    const params = Object.fromEntries(searchParams.entries());
    const query = querySchema.parse(params);

    const skip = (query.page - 1) * query.limit;

    // Build where clause
    const where: Record<string, unknown> = {
      tenantId,
      productId: query.productId,
      status: query.status,
    };

    // Remove undefined values
    Object.keys(where).forEach(key => {
      if (where[key] === undefined) delete where[key];
    });

    // Add search filter
    if (query.search) {
      where.OR = [
        { batchNumber: { ilike: `%${query.search}%` } },
        { supplierBatchRef: { ilike: `%${query.search}%` } },
        { product: { name: { ilike: `%${query.search}%` } } },
        { product: { sku: { ilike: `%${query.search}%` } } },
      ];
    }

    // Add expiry filter
    if (query.expiringWithinDays) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + query.expiringWithinDays);
      where.expiryDate = {
        lte: futureDate,
        gte: new Date(),
      };
      where.status = 'ACTIVE';
    }

    // Get total count - using any type since new models need prisma generate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = await (prisma as any).batch.count({ where });

    // Get batches with pagination
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const batches = await (prisma as any).batch.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            name: true,
            unit: true,
          },
        },
        stockLevel: {
          select: {
            id: true,
            location: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { serialNumbers: true },
        },
      },
    });

    return NextResponse.json({
      batches,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/batches - Create a new batch
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
    }

    // Check permission - only admins and owners can create batches
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const data = createBatchSchema.parse(body);

    // Verify product exists and belongs to tenant
    const product = await prisma.product.findFirst({
      where: { id: data.productId, tenantId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check for duplicate batch number for this product
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingBatch = await (prisma as any).batch.findFirst({
      where: {
        tenantId,
        productId: data.productId,
        batchNumber: data.batchNumber,
      },
    });

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch number already exists for this product' },
        { status: 409 }
      );
    }

    // Create batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const batch = await (prisma as any).batch.create({
      data: {
        tenantId,
        productId: data.productId,
        stockLevelId: data.stockLevelId,
        batchNumber: data.batchNumber,
        manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        quantity: data.quantity,
        unitCost: data.unitCost,
        supplierId: data.supplierId,
        supplierBatchRef: data.supplierBatchRef,
        notes: data.notes,
        receivedBy: user.id,
        receivedAt: new Date(),
      },
      include: {
        product: {
          select: { id: true, sku: true, name: true },
        },
      },
    });

    // Create inventory event for batch receipt
    await prisma.inventoryEvent.create({
      data: {
        tenantId,
        type: 'STOCK_RECEIVED',
        productId: data.productId,
        locationId: data.stockLevelId,
        quantityDelta: data.quantity,
        runningBalance: data.quantity, // Will be updated by trigger or recalculation
        referenceType: 'BATCH',
        referenceId: batch.id,
        userId: user.id,
        notes: `Batch ${data.batchNumber} received`,
        metadata: { batchNumber: data.batchNumber },
      },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
