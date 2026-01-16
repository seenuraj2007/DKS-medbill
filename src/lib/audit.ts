import { supabase } from './supabase'

export class AuditService {
  /**
   * Log user action
   */
  static async logAction(
    userId: string | number | null,
    organizationId: string | number | null,
    action: string,
    resourceType: string,
    resourceId: string | number | null = null,
    oldValue: unknown = null,
    newValue: unknown = null,
    ipAddress: string | null = null,
    userAgent: string | null = null
  ) {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          organization_id: organizationId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_value: oldValue ? JSON.stringify(oldValue) : null,
          new_value: newValue ? JSON.stringify(newValue) : null,
          ip_address: ipAddress,
          user_agent: userAgent
        })

      if (error) {
        console.error('Failed to log audit entry:', error)
      }
    } catch (error) {
      console.error('Failed to log audit entry:', error)
    }
  }

  /**
   * Get audit logs for organization
   */
  static async getOrganizationLogs(
    organizationId: string | number,
    filters: {
      userId?: string | number
      resourceType?: string
      resourceId?: string | number
      startDate?: string
      endDate?: string
      limit?: number
      offset?: number
    } = {}
  ): Promise<Array<{ id: string; user_email?: string; user_name?: string }>> {
    let query = supabase
      .from('audit_logs')
      .select(`
        *,
        users!user_id (email, full_name)
      `)
      .eq('organization_id', organizationId)

    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }

    if (filters.resourceType) {
      query = query.eq('resource_type', filters.resourceType)
    }

    if (filters.resourceId) {
      query = query.eq('resource_id', filters.resourceId)
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    query = query.order('created_at', { ascending: false })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to get audit logs:', error)
      return []
    }

    return data || []
  }

  /**
   * Get audit logs for specific resource
   */
  static async getResourceLogs(
    resourceType: string,
    resourceId: string | number,
    limit: number = 50
  ): Promise<Array<{ id: string; user_email?: string; user_name?: string }>> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        users!user_id ()
      `)
      .eq('email, full_nameresource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to get resource logs:', error)
      return []
    }

    return data || []
  }

  /**
   * Get recent activity
   */
  static async getRecentActivity(
    organizationId: string | number,
    limit: number = 20
  ): Promise<Array<{ id: string; user_email?: string; user_name?: string }>> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        users!user_id (email, full_name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to get recent activity:', error)
      return []
    }

    return data || []
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
