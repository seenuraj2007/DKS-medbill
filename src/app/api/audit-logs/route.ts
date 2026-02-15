import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTenantAuditLogs, getEntityAuditLogs, formatAuditLog } from '@/lib/audit';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  userId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  action: z.string().optional(),
  entityId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

type EntityType = 'Product' | 'StockLevel' | 'Location' | 'Invoice' | 'InvoiceItem' | 'PurchaseOrder' | 'PurchaseOrderItem' | 'Customer' | 'Supplier' | 'User' | 'Member' | 'Tenant' | 'Batch' | 'SerialNumber' | 'StockTake' | 'StockTakeItem' | 'StockTransfer' | 'Alert' | 'WhatsAppSettings' | 'ProductSettings';

type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW' | 'EXPORT' | 'IMPORT' | 'ADJUSTMENT' | 'TRANSFER' | 'APPROVE' | 'REJECT';

// GET /api/audit-logs - Get audit logs with filtering
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

    // Only admins and owners can view audit logs
    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const query = querySchema.parse(params);

    // If entityId is provided, get entity-specific logs
    if (query.entityId && query.entityType) {
      const logs = await getEntityAuditLogs(
        tenantId,
        query.entityType as EntityType,
        query.entityId,
        query.limit
      );

      return NextResponse.json({
        logs: logs.map((log: any) => ({
          ...log,
          formatted: formatAuditLog(log),
        })),
      });
    }

    // Get tenant-wide audit logs
    const result = await getTenantAuditLogs(tenantId, {
      page: query.page,
      limit: query.limit,
      userId: query.userId,
      entityType: query.entityType as EntityType | undefined,
      action: query.action as AuditAction | undefined,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });

    return NextResponse.json({
      logs: result.logs.map((log: any) => ({
        ...log,
        formatted: formatAuditLog(log),
      })),
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
