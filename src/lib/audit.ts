import { prisma } from './prisma';
import { NextRequest } from 'next/server';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'EXPORT'
  | 'IMPORT'
  | 'ADJUSTMENT'
  | 'TRANSFER'
  | 'APPROVE'
  | 'REJECT';

export type EntityType =
  | 'Product'
  | 'StockLevel'
  | 'Location'
  | 'Invoice'
  | 'InvoiceItem'
  | 'PurchaseOrder'
  | 'PurchaseOrderItem'
  | 'Customer'
  | 'Supplier'
  | 'User'
  | 'Member'
  | 'Tenant'
  | 'Batch'
  | 'SerialNumber'
  | 'StockTake'
  | 'StockTakeItem'
  | 'StockTransfer'
  | 'Alert'
  | 'WhatsAppSettings'
  | 'ProductSettings';

interface AuditLogData {
  tenantId: string;
  userId?: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  request?: NextRequest;
}

/**
 * Log an audit event
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    // Extract changed fields if both old and new values are provided
    let changedFields: string[] | undefined;
    if (data.oldValues && data.newValues) {
      changedFields = Object.keys(data.newValues).filter(
        key => JSON.stringify(data.oldValues![key]) !== JSON.stringify(data.newValues![key])
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).auditLog.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        changedFields: changedFields ? JSON.stringify(changedFields) : null,
        ipAddress: data.request ? getClientIp(data.request) : null,
        userAgent: data.request?.headers.get('user-agent') || null,
        requestUrl: data.request?.url || null,
        requestMethod: data.request?.method || null,
        metadata: data.metadata,
      },
    });
  } catch (error) {
    // Don't throw on audit log failure - just log it
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Log a create event
 */
export async function logCreate(
  tenantId: string,
  userId: string | undefined,
  entityType: EntityType,
  entityId: string,
  newValues: Record<string, unknown>,
  request?: NextRequest
): Promise<void> {
  await logAudit({
    tenantId,
    userId,
    action: 'CREATE',
    entityType,
    entityId,
    newValues,
    request,
  });
}

/**
 * Log an update event
 */
export async function logUpdate(
  tenantId: string,
  userId: string | undefined,
  entityType: EntityType,
  entityId: string,
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
  request?: NextRequest
): Promise<void> {
  await logAudit({
    tenantId,
    userId,
    action: 'UPDATE',
    entityType,
    entityId,
    oldValues,
    newValues,
    request,
  });
}

/**
 * Log a delete event
 */
export async function logDelete(
  tenantId: string,
  userId: string | undefined,
  entityType: EntityType,
  entityId: string,
  oldValues: Record<string, unknown>,
  request?: NextRequest
): Promise<void> {
  await logAudit({
    tenantId,
    userId,
    action: 'DELETE',
    entityType,
    entityId,
    oldValues,
    request,
  });
}

/**
 * Get audit logs for an entity
 */
export async function getEntityAuditLogs(
  tenantId: string,
  entityType: EntityType,
  entityId: string,
  limit: number = 50
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (prisma as any).auditLog.findMany({
    where: {
      tenantId,
      entityType,
      entityId,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get audit logs for a tenant with filtering
 */
export async function getTenantAuditLogs(
  tenantId: string,
  options: {
    page?: number;
    limit?: number;
    userId?: string;
    entityType?: EntityType;
    action?: AuditAction;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const {
    page = 1,
    limit = 50,
    userId,
    entityType,
    action,
    startDate,
    endDate,
  } = options;

  const where: Record<string, unknown> = { tenantId };

  if (userId) where.userId = userId;
  if (entityType) where.entityType = entityType;
  if (action) where.action = action;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
    if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, total] = await Promise.all([
    (prisma as any).auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    (prisma as any).auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Extract client IP from request
 */
function getClientIp(request: NextRequest): string | null {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to socket address if available
  return null;
}

/**
 * Format audit log for display
 */
export function formatAuditLog(log: {
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: unknown;
  newValues?: unknown;
  changedFields?: string | null;
  createdAt: Date;
}): string {
  const changes = log.changedFields
    ? `Changed: ${log.changedFields}`
    : '';

  switch (log.action) {
    case 'CREATE':
      return `Created ${log.entityType} (${log.entityId})`;
    case 'UPDATE':
      return `Updated ${log.entityType} (${log.entityId}). ${changes}`;
    case 'DELETE':
      return `Deleted ${log.entityType} (${log.entityId})`;
    case 'LOGIN':
      return 'User logged in';
    case 'LOGOUT':
      return 'User logged out';
    case 'EXPORT':
      return `Exported ${log.entityType} data`;
    case 'IMPORT':
      return `Imported ${log.entityType} data`;
    case 'ADJUSTMENT':
      return `Stock adjustment for ${log.entityType} (${log.entityId})`;
    case 'TRANSFER':
      return `Stock transfer for ${log.entityType} (${log.entityId})`;
    default:
      return `${log.action} on ${log.entityType} (${log.entityId})`;
  }
}
