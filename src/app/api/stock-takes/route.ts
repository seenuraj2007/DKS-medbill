import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const createStockTakeSchema = z.object({
  locationId: z.string().uuid(),
  scheduledDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  locationId: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED']).optional(),
  sortBy: z.enum(['createdAt', 'scheduledDate', 'completedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// GET /api/stock-takes - List stock takes
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
      locationId: query.locationId,
      status: query.status,
    };

    // Remove undefined values
    Object.keys(where).forEach(key => {
      if (where[key] === undefined) delete where[key];
    });

    // Get total count
    const total = await (prisma as any).stockTake.count({ where });

    // Get stock takes with pagination
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockTakes: any[] = await (prisma as any).stockTake.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({
      stockTakes,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching stock takes:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/stock-takes - Create a new stock take
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
    const data = createStockTakeSchema.parse(body);

    // Verify location exists and belongs to tenant
    const location = await prisma.location.findFirst({
      where: { id: data.locationId, tenantId, isActive: true },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Check for existing in-progress stock take for this location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing: any = await (prisma as any).stockTake.findFirst({
      where: {
        tenantId,
        locationId: data.locationId,
        status: { in: ['DRAFT', 'IN_PROGRESS'] },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An active stock take already exists for this location', existingStockTakeId: existing.id },
        { status: 409 }
      );
    }

    // Generate reference number
    const stockTakeCount = await (prisma as any).stockTake.count({ where: { tenantId } });
    const referenceNumber = `ST-${new Date().getFullYear()}-${String(stockTakeCount + 1).padStart(5, '0')}`;

    // Get all stock levels for this location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockLevels: any[] = await prisma.stockLevel.findMany({
      where: { tenantId, locationId: data.locationId },
      include: {
        product: {
          select: { id: true, sku: true, name: true, unit: true },
        },
      },
    });

    // Create stock take with items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stockTake: any = await (prisma as any).stockTake.create({
      data: {
        tenantId,
        locationId: data.locationId,
        referenceNumber,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        notes: data.notes,
        createdBy: user.id,
        totalItems: stockLevels.length,
        items: {
          create: stockLevels.map((sl: any) => ({
            productId: sl.productId,
            systemQuantity: sl.quantity,
          })),
        },
      },
      include: {
        location: true,
        items: {
          include: {
            product: {
              select: { id: true, sku: true, name: true, unit: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ stockTake }, { status: 201 });
  } catch (error) {
    console.error('Error creating stock take:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
