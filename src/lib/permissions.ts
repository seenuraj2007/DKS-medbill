export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface UserWithPermissions {
  id: number
  email: string
  full_name: string | null
  organization_id: number | null
  role: UserRole
  status: string
  created_at: string
}

export interface Permission {
  resource: string
  action: string
  allowed: boolean
}

// Role permissions matrix
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    // Users & Teams
    { resource: 'users', action: 'create', allowed: true },
    { resource: 'users', action: 'read', allowed: true },
    { resource: 'users', action: 'update', allowed: true },
    { resource: 'users', action: 'delete', allowed: true },
    { resource: 'users', action: 'invite', allowed: true },
    { resource: 'organizations', action: 'update', allowed: true },
    { resource: 'organizations', action: 'delete', allowed: true },
    
    // Products
    { resource: 'products', action: 'create', allowed: true },
    { resource: 'products', action: 'read', allowed: true },
    { resource: 'products', action: 'update', allowed: true },
    { resource: 'products', action: 'delete', allowed: true },
    { resource: 'products', action: 'stock_update', allowed: true },
    
    // Locations
    { resource: 'locations', action: 'create', allowed: true },
    { resource: 'locations', action: 'read', allowed: true },
    { resource: 'locations', action: 'update', allowed: true },
    { resource: 'locations', action: 'delete', allowed: true },
    
    // Suppliers
    { resource: 'suppliers', action: 'create', allowed: true },
    { resource: 'suppliers', action: 'read', allowed: true },
    { resource: 'suppliers', action: 'update', allowed: true },
    { resource: 'suppliers', action: 'delete', allowed: true },
    
    // Purchase Orders
    { resource: 'purchase_orders', action: 'create', allowed: true },
    { resource: 'purchase_orders', action: 'read', allowed: true },
    { resource: 'purchase_orders', action: 'update', allowed: true },
    { resource: 'purchase_orders', action: 'delete', allowed: true },
    { resource: 'purchase_orders', action: 'receive', allowed: true },
    
    // Stock Transfers
    { resource: 'stock_transfers', action: 'create', allowed: true },
    { resource: 'stock_transfers', action: 'read', allowed: true },
    { resource: 'stock_transfers', action: 'update', allowed: true },
    { resource: 'stock_transfers', action: 'delete', allowed: true },
    { resource: 'stock_transfers', action: 'approve', allowed: true },
    
    // Sales & Customers
    { resource: 'sales', action: 'create', allowed: true },
    { resource: 'sales', action: 'read', allowed: true },
    { resource: 'sales', action: 'update', allowed: true },
    { resource: 'sales', action: 'delete', allowed: true },
    { resource: 'customers', action: 'create', allowed: true },
    { resource: 'customers', action: 'read', allowed: true },
    { resource: 'customers', action: 'update', allowed: true },
    { resource: 'customers', action: 'delete', allowed: true },
    
    // Alerts
    { resource: 'alerts', action: 'read', allowed: true },
    { resource: 'alerts', action: 'update', allowed: true },
    
    // Analytics
    { resource: 'analytics', action: 'read', allowed: true },
    { resource: 'reports', action: 'read', allowed: true },
    { resource: 'reports', action: 'export', allowed: true },
    
    // Settings
    { resource: 'settings', action: 'update', allowed: true },
  ],
  
  admin: [
    // Users & Teams
    { resource: 'users', action: 'read', allowed: true },
    { resource: 'users', action: 'update', allowed: true },
    { resource: 'organizations', action: 'update', allowed: true },
    
    // Products
    { resource: 'products', action: 'create', allowed: true },
    { resource: 'products', action: 'read', allowed: true },
    { resource: 'products', action: 'update', allowed: true },
    { resource: 'products', action: 'delete', allowed: true },
    { resource: 'products', action: 'stock_update', allowed: true },
    
    // Locations
    { resource: 'locations', action: 'create', allowed: true },
    { resource: 'locations', action: 'read', allowed: true },
    { resource: 'locations', action: 'update', allowed: true },
    { resource: 'locations', action: 'delete', allowed: true },
    
    // Suppliers
    { resource: 'suppliers', action: 'create', allowed: true },
    { resource: 'suppliers', action: 'read', allowed: true },
    { resource: 'suppliers', action: 'update', allowed: true },
    { resource: 'suppliers', action: 'delete', allowed: true },
    
    // Purchase Orders
    { resource: 'purchase_orders', action: 'create', allowed: true },
    { resource: 'purchase_orders', action: 'read', allowed: true },
    { resource: 'purchase_orders', action: 'update', allowed: true },
    { resource: 'purchase_orders', action: 'delete', allowed: true },
    { resource: 'purchase_orders', action: 'receive', allowed: true },
    
    // Stock Transfers
    { resource: 'stock_transfers', action: 'create', allowed: true },
    { resource: 'stock_transfers', action: 'read', allowed: true },
    { resource: 'stock_transfers', action: 'update', allowed: true },
    { resource: 'stock_transfers', action: 'delete', allowed: true },
    { resource: 'stock_transfers', action: 'approve', allowed: true },
    
    // Sales & Customers
    { resource: 'sales', action: 'create', allowed: true },
    { resource: 'sales', action: 'read', allowed: true },
    { resource: 'sales', action: 'update', allowed: true },
    { resource: 'sales', action: 'delete', allowed: true },
    { resource: 'customers', action: 'create', allowed: true },
    { resource: 'customers', action: 'read', allowed: true },
    { resource: 'customers', action: 'update', allowed: true },
    { resource: 'customers', action: 'delete', allowed: true },
    
    // Alerts
    { resource: 'alerts', action: 'read', allowed: true },
    { resource: 'alerts', action: 'update', allowed: true },
    
    // Analytics
    { resource: 'analytics', action: 'read', allowed: true },
    { resource: 'reports', action: 'read', allowed: true },
    { resource: 'reports', action: 'export', allowed: true },
    
    // Settings
    { resource: 'settings', action: 'update', allowed: true },
  ],
  
  editor: [
    // Products
    { resource: 'products', action: 'create', allowed: true },
    { resource: 'products', action: 'read', allowed: true },
    { resource: 'products', action: 'update', allowed: true },
    { resource: 'products', action: 'stock_update', allowed: true },
    
    // Locations
    { resource: 'locations', action: 'read', allowed: true },
    { resource: 'locations', action: 'update', allowed: true },
    
    // Suppliers
    { resource: 'suppliers', action: 'create', allowed: true },
    { resource: 'suppliers', action: 'read', allowed: true },
    { resource: 'suppliers', action: 'update', allowed: true },
    
    // Purchase Orders
    { resource: 'purchase_orders', action: 'create', allowed: true },
    { resource: 'purchase_orders', action: 'read', allowed: true },
    { resource: 'purchase_orders', action: 'update', allowed: true },
    { resource: 'purchase_orders', action: 'receive', allowed: true },
    
    // Stock Transfers
    { resource: 'stock_transfers', action: 'create', allowed: true },
    { resource: 'stock_transfers', action: 'read', allowed: true },
    { resource: 'stock_transfers', action: 'update', allowed: true },
    
    // Sales & Customers
    { resource: 'sales', action: 'create', allowed: true },
    { resource: 'sales', action: 'read', allowed: true },
    { resource: 'sales', action: 'update', allowed: true },
    { resource: 'customers', action: 'create', allowed: true },
    { resource: 'customers', action: 'read', allowed: true },
    { resource: 'customers', action: 'update', allowed: true },
    
    // Alerts
    { resource: 'alerts', action: 'read', allowed: true },
    { resource: 'alerts', action: 'update', allowed: true },
    
    // Analytics
    { resource: 'analytics', action: 'read', allowed: true },
    { resource: 'reports', action: 'read', allowed: true },
  ],
  
  viewer: [
    // Products
    { resource: 'products', action: 'read', allowed: true },
    
    // Locations
    { resource: 'locations', action: 'read', allowed: true },
    
    // Suppliers
    { resource: 'suppliers', action: 'read', allowed: true },
    
    // Purchase Orders
    { resource: 'purchase_orders', action: 'read', allowed: true },
    
    // Stock Transfers
    { resource: 'stock_transfers', action: 'read', allowed: true },
    
    // Sales & Customers
    { resource: 'sales', action: 'read', allowed: true },
    { resource: 'customers', action: 'read', allowed: true },
    
    // Alerts
    { resource: 'alerts', action: 'read', allowed: true },
    
    // Analytics
    { resource: 'analytics', action: 'read', allowed: true },
    { resource: 'reports', action: 'read', allowed: true },
  ],
}

export class PermissionsService {
  /**
   * Check if user has permission to perform action on resource
   */
  static hasPermission(user: UserWithPermissions | null, resource: string, action: string): boolean {
    if (!user) return false
    
    const role = user.role as UserRole
    const permissions = ROLE_PERMISSIONS[role] || []
    
    const permission = permissions.find(
      p => p.resource === resource && p.action === action
    )
    
    return permission?.allowed || false
  }
  
  /**
   * Check if user can manage other users
   */
  static canManageUsers(user: UserWithPermissions | null): boolean {
    return this.hasPermission(user, 'users', 'create') &&
           this.hasPermission(user, 'users', 'update') &&
           this.hasPermission(user, 'users', 'delete')
  }
  
  /**
   * Check if user can perform destructive actions (delete)
   */
  static canDelete(user: UserWithPermissions | null, resource: string): boolean {
    return this.hasPermission(user, resource, 'delete')
  }
  
  /**
   * Check if user can perform updates
   */
  static canUpdate(user: UserWithPermissions | null, resource: string): boolean {
    return this.hasPermission(user, resource, 'update')
  }
  
  /**
   * Check if user can create resources
   */
  static canCreate(user: UserWithPermissions | null, resource: string): boolean {
    return this.hasPermission(user, resource, 'create')
  }
  
  /**
   * Check if user can export reports
   */
  static canExportReports(user: UserWithPermissions | null): boolean {
    return this.hasPermission(user, 'reports', 'export')
  }
  
  /**
   * Get all permissions for a user role
   */
  static getPermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || []
  }
  
  /**
   * Check if user is owner
   */
  static isOwner(user: UserWithPermissions | null): boolean {
    return user?.role === 'owner'
  }
  
  /**
   * Check if user has admin-level access
   */
  static isAdmin(user: UserWithPermissions | null): boolean {
    return user?.role === 'owner' || user?.role === 'admin'
  }
  
  /**
   * Validate that user is active and in organization
   */
  static isValidUser(user: UserWithPermissions | null): boolean {
    if (!user) return false
    return user.status === 'active' && user.organization_id !== null
  }
}
