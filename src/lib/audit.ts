import db from './db'

export function migrateAuditTrail() {
  try {
    console.log('Starting audit trail migration...')

    // 1. Create audit_logs table
    db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        organization_id INTEGER,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id INTEGER,
        old_value TEXT,
        new_value TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      );
    `)

    // 2. Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
    `)

    console.log('Audit trail migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export class AuditService {
  /**
   * Log user action
   */
  static logAction(
    userId: number | null,
    organizationId: number | null,
    action: string,
    resourceType: string,
    resourceId: number | null = null,
    oldValue: any = null,
    newValue: any = null,
    ipAddress: string | null = null,
    userAgent: string | null = null
  ) {
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, organization_id, action, resource_type, resource_id,
                              old_value, new_value, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        organizationId,
        action,
        resourceType,
        resourceId,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        ipAddress,
        userAgent
      )
    } catch (error) {
      console.error('Failed to log audit entry:', error)
    }
  }

  /**
   * Get audit logs for organization
   */
  static getOrganizationLogs(
    organizationId: number,
    filters: {
      userId?: number
      resourceType?: string
      resourceId?: number
      startDate?: string
      endDate?: string
      limit?: number
      offset?: number
    } = {}
  ): any[] {
    let query = `
      SELECT 
        al.*,
        u.email as user_email,
        u.full_name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.organization_id = ?
    `
    const params: any[] = [organizationId]

    if (filters.userId) {
      query += ' AND al.user_id = ?'
      params.push(filters.userId)
    }

    if (filters.resourceType) {
      query += ' AND al.resource_type = ?'
      params.push(filters.resourceType)
    }

    if (filters.resourceId) {
      query += ' AND al.resource_id = ?'
      params.push(filters.resourceId)
    }

    if (filters.startDate) {
      query += ' AND al.created_at >= ?'
      params.push(filters.startDate)
    }

    if (filters.endDate) {
      query += ' AND al.created_at <= ?'
      params.push(filters.endDate)
    }

    query += ' ORDER BY al.created_at DESC'

    if (filters.limit) {
      query += ' LIMIT ?'
      params.push(filters.limit)
    }

    if (filters.offset) {
      query += ' OFFSET ?'
      params.push(filters.offset)
    }

    return db.prepare(query).all(...params)
  }

  /**
   * Get audit logs for specific resource
   */
  static getResourceLogs(
    resourceType: string,
    resourceId: number,
    limit: number = 50
  ): any[] {
    return db.prepare(`
      SELECT 
        al.*,
        u.email as user_email,
        u.full_name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.resource_type = ? AND al.resource_id = ?
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(resourceType, resourceId, limit)
  }

  /**
   * Get recent activity
   */
  static getRecentActivity(
    organizationId: number,
    limit: number = 20
  ): any[] {
    return db.prepare(`
      SELECT 
        al.*,
        u.email as user_email,
        u.full_name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.organization_id = ?
      ORDER BY al.created_at DESC
      LIMIT ?
    `).all(organizationId, limit)
  }

  /**
   * Clean old audit logs (retention policy)
   */
  static cleanOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = db.prepare(`
      DELETE FROM audit_logs
      WHERE created_at < ?
    `).run(cutoffDate.toISOString())

    return result.changes
  }
}

// Predefined audit actions
export const AuditActions = {
  // User actions
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_INVITED: 'user.invited',
  USER_ROLE_CHANGED: 'user.role_changed',

  // Product actions
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  PRODUCT_STOCK_UPDATED: 'product.stock_updated',
  PRODUCT_REORDER_UPDATED: 'product.reorder_updated',

  // Variant actions
  VARIANT_CREATED: 'variant.created',
  VARIANT_UPDATED: 'variant.updated',
  VARIANT_DELETED: 'variant.deleted',

  // Batch actions
  BATCH_CREATED: 'batch.created',
  BATCH_UPDATED: 'batch.updated',
  BATCH_DELETED: 'batch.deleted',
  BATCH_EXPIRED: 'batch.expired',

  // Location actions
  LOCATION_CREATED: 'location.created',
  LOCATION_UPDATED: 'location.updated',
  LOCATION_DELETED: 'location.deleted',

  // Supplier actions
  SUPPLIER_CREATED: 'supplier.created',
  SUPPLIER_UPDATED: 'supplier.updated',
  SUPPLIER_DELETED: 'supplier.deleted',

  // Customer actions
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',

  // Sale actions
  SALE_CREATED: 'sale.created',
  SALE_UPDATED: 'sale.updated',
  SALE_DELETED: 'sale.deleted',
  SALE_REFUNDED: 'sale.refunded',

  // Purchase order actions
  PURCHASE_ORDER_CREATED: 'purchase_order.created',
  PURCHASE_ORDER_UPDATED: 'purchase_order.updated',
  PURCHASE_ORDER_DELETED: 'purchase_order.deleted',
  PURCHASE_ORDER_RECEIVED: 'purchase_order.received',

  // Stock transfer actions
  TRANSFER_CREATED: 'transfer.created',
  TRANSFER_UPDATED: 'transfer.updated',
  TRANSFER_COMPLETED: 'transfer.completed',
  TRANSFER_CANCELLED: 'transfer.cancelled',

  // Organization actions
  ORGANIZATION_CREATED: 'organization.created',
  ORGANIZATION_UPDATED: 'organization.updated',
  ORGANIZATION_DELETED: 'organization.deleted',

  // Settings actions
  SETTINGS_UPDATED: 'settings.updated',
  BACKUP_CREATED: 'backup.created',
  BACKUP_RESTORED: 'backup.restored',
} as const

// Predefined resource types
export const ResourceTypes = {
  USER: 'user',
  PRODUCT: 'product',
  VARIANT: 'variant',
  BATCH: 'batch',
  LOCATION: 'location',
  SUPPLIER: 'supplier',
  CUSTOMER: 'customer',
  SALE: 'sale',
  PURCHASE_ORDER: 'purchase_order',
  STOCK_TRANSFER: 'stock_transfer',
  ORGANIZATION: 'organization',
  SETTINGS: 'settings',
  BACKUP: 'backup',
} as const

// Run migration if executed directly
if (require.main === module) {
  migrateAuditTrail()
}
