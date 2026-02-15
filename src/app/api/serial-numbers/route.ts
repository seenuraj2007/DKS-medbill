import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const createSerialSchema = z.object({
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  stockLevelId: z.string().uuid().optional(),
  serialNumber: z.string().min(1).max(200),
  alternateSerial: z.string().optional(),
  warrantyMonths: z.number().int().min(0).max(120).optional(),
  unitCost: z.number().min(0).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const bulkCreateSerialSchema = z.object({
  productId: z.string().uuid(),
  batchId: z.string().uuid().optional(),
  stockLevelId: z.string().uuid().optional(),
  serialNumbers: z.array(z.string().min(1).max(200)).min(1).max(500),
  warrantyMonths: z.number().int().min(0).max(120).optional(),
  unitCost: z.number().min(0).optional(),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  productId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  status: z.enum(['IN_STOCK', 'RESERVED', 'SOLD', 'DEFECTIVE', 'RETURNED', 'IN_TRANSIT', 'QUARANTINE']).optional(),
  customerId: z.string().uuid().optional(),
  sortBy: z.enum(['serialNumber', 'createdAt', 'warrantyExpiry']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// GET /api/serial-numbers - List serial numbers with filtering
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
      batchId: query.batchId,
      status: query.status,
      customerId: query.customerId,
    };

    // Remove undefined values
    Object.keys(where).forEach(key => {
      if (where[key] === undefined) delete where[key];
    });

    // Add search filter
    if (query.search) {
      where.OR = [
        { serialNumber: { ilike: `%${query.search}%` } },
        { alternateSerial: { ilike: `%${query.search}%` } },
        { product: { name: { ilike: `%${query.search}%` } } },
        { product: { sku: { ilike: `%${query.search}%` } } },
      ];
    }

    // Get total count
    const total = await (prisma as any).serialNumber.count({ where });

    // Get serial numbers with pagination
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialNumbers: any[] = await (prisma as any).serialNumber.findMany({
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
            sellingPrice: true,
          },
        },
        batch: {
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
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
      },
    });

    return NextResponse.json({
      serialNumbers,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching serial numbers:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/serial-numbers - Create a single serial number
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

    // Check permission - only OWNER and ADMIN can create
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();

    // Check if bulk create
    if (body.serialNumbers && Array.isArray(body.serialNumbers)) {
      const data = bulkCreateSerialSchema.parse(body);
      return handleBulkCreate(tenantId, user.id, data);
    }

    const data = createSerialSchema.parse(body);

    // Verify product exists
    const product = await prisma.product.findFirst({
      where: { id: data.productId, tenantId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check for duplicate serial number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing: any = await (prisma as any).serialNumber.findFirst({
      where: {
        tenantId,
        productId: data.productId,
        serialNumber: data.serialNumber,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Serial number already exists for this product' },
        { status: 409 }
      );
    }

    // Calculate warranty expiry if months provided
    let warrantyExpiry: Date | undefined;
    if (data.warrantyMonths) {
      warrantyExpiry = new Date();
      warrantyExpiry.setMonth(warrantyExpiry.getMonth() + data.warrantyMonths);
    }

    // Create serial number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialNumber: any = await (prisma as any).serialNumber.create({
      data: {
        tenantId,
        productId: data.productId,
        batchId: data.batchId,
        stockLevelId: data.stockLevelId,
        serialNumber: data.serialNumber,
        alternateSerial: data.alternateSerial,
        warrantyMonths: data.warrantyMonths,
        warrantyExpiry,
        unitCost: data.unitCost,
        notes: data.notes,
        metadata: data.metadata,
        createdBy: user.id,
      },
      include: {
        product: { select: { id: true, sku: true, name: true } },
      },
    });

    return NextResponse.json({ serialNumber }, { status: 201 });
  } catch (error) {
    console.error('Error creating serial number:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle bulk create
async function handleBulkCreate(
  tenantId: string,
  userId: string,
  data: z.infer<typeof bulkCreateSerialSchema>
) {
  // Verify product exists
  const product = await prisma.product.findFirst({
    where: { id: data.productId, tenantId },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Check for duplicate serial numbers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing: any[] = await (prisma as any).serialNumber.findMany({
    where: {
      tenantId,
      productId: data.productId,
      serialNumber: { in: data.serialNumbers },
    },
    select: { serialNumber: true },
  });

  if (existing.length > 0) {
    return NextResponse.json(
      {
        error: 'Some serial numbers already exist',
        duplicates: existing.map(s => s.serialNumber),
      },
      { status: 409 }
    );
  }

  // Calculate warranty expiry
  let warrantyExpiry: Date | undefined;
  if (data.warrantyMonths) {
    warrantyExpiry = new Date();
    warrantyExpiry.setMonth(warrantyExpiry.getMonth() + data.warrantyMonths);
  }

  // Create serial numbers in batches
  const created: number[] = [];
  const batchSize = 50;

  for (let i = 0; i < data.serialNumbers.length; i += batchSize) {
    const batch = data.serialNumbers.slice(i, i + batchSize);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = await (prisma as any).serialNumber.createMany({
      data: batch.map((serial: string) => ({
        tenantId,
        productId: data.productId,
        batchId: data.batchId,
        stockLevelId: data.stockLevelId,
        serialNumber: serial,
        warrantyMonths: data.warrantyMonths,
        warrantyExpiry,
        unitCost: data.unitCost,
        createdBy: userId,
      })),
    });
    created.push(results.count);
  }

  return NextResponse.json({
    message: 'Serial numbers created successfully',
    count: created.reduce((a, b) => a + b, 0),
  });
}
