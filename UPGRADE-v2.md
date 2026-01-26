# DKS StockAlert v2.0 - Major Update

## 🎯 Overview

This update transforms DKS StockAlert from a single-user inventory tool into a comprehensive **multi-tenant enterprise-ready inventory management system** with team collaboration, sales tracking, batch management, and full audit trails.

## 🚀 New Features

### 1. **Multi-User & Team Collaboration**

**New Roles:**
- **Owner**: Full access, can delete organization, manage all users
- **Admin**: Can invite team, manage all resources except owner actions
- **Editor**: Can create/edit products, sales, POs, transfers
- **Viewer**: Read-only access to all data

**Team Management:**
- Invite team members via email
- Set roles (Admin/Editor/Viewer)
- Accept/decline invitations
- Remove team members
- Transfer organization ownership

**API Endpoints:**
```
GET /api/team          - List team members and pending invitations
POST /api/team/invite  - Send invitation
PATCH /api/team/[id]  - Update member role
DELETE /api/team/[id]  - Remove team member
```

### 2. **Sales & Revenue Tracking**

**Customers:**
- Full customer management (name, email, phone, company, address)
- Customer history and notes

**Sales Orders:**
- Create sales with line items
- Multiple payment methods
- Payment status tracking (paid/pending/refunded)
- Automatic COGS (Cost of Goods Sold) calculation

**COGS Tracking:**
- Automatic cost of goods sold calculation per sale
- Revenue tracking per product
- Profit margin reporting

**API Endpoints:**
```
GET /api/sales       - List sales with date/customer filters
POST /api/sales      - Create new sale
```

### 3. **Product Variants & Bundles**

**Variants:**
- Size/color/SKU variants per product
- Independent quantity and pricing per variant
- Variant-specific reorder points

**Bundles:**
- Product bundles/kits (e.g., "Starter Pack")
- Bundle-level discounts
- Automatic inventory deduction for all bundle components

**New Tables:**
```sql
product_variants    - Size/color variants
product_bundles     - Product bundles
bundle_items        - Bundle components
```

### 4. **Batch & Expiry Tracking (FIFO)**

**Features:**
- Batch numbers for traceability
- Manufacturing and expiry dates
- Automatic FIFO (First-In-First-Out) allocation
- Expiry alerts (7 days, 30 days)
- Waste/damage tracking

**Automatic Alerts:**
- Expiring soon (7 days)
- Expired items
- Low quantity per batch

**Helper Functions:**
```javascript
createBatch()                    - Create new batch
allocateStockFromBatches()     - FIFO allocation
getExpiringBatches()           - Get expiring items
```

### 5. **Comprehensive Audit Trail**

**What's Logged:**
- Every user action with timestamp
- User ID, IP address, user agent
- Resource type and ID
- Old value → New value
- Action type (create/update/delete)

**Audit Actions:**
- User login/logout/signup
- All CRUD operations
- Stock changes
- Sales, POs, transfers
- Backup/restore operations

**API:**
```javascript
AuditService.logAction()         - Log user action
AuditService.getOrganizationLogs()  - Get filtered logs
AuditService.getResourceLogs()       - Get specific resource history
AuditService.getRecentActivity()   - Get activity feed
```

### 6. **Data Backup & Restore**

**Backup Formats:**
- JSON - Full data dump with relationships
- SQL - INSERT statements for all tables

**Backup Features:**
- Export entire organization data
- Date range filtering
- Select specific tables
- Automatic version tracking

**Restore Features:**
- Import from JSON/SQL files
- Duplicate prevention (ON CONFLICT REPLACE)
- Change tracking
- Rollback support

**API Endpoints:**
```
GET /api/backup?format=json     - Download backup
POST /api/backup                - Restore from file
```

### 7. **Data Export System**

**Export Formats:**
- CSV - Spreadsheet compatible
- JSON - API compatible
- Custom SQL queries

**Export Types:**
- Full inventory report
- Sales reports (with totals)
- Customer lists
- Supplier lists
- Location reports
- Custom filtered exports

**Features:**
- Date range filtering
- Location filtering
- Status filtering
- Automatic column headers
- Proper CSV escaping

**API Endpoints:**
```
GET /api/export?table=products&format=csv      - Export table
POST /api/export/custom                           - Custom SQL export
```

### 8. **Location Data Fix**

**Problem Fixed:**
- `products.current_quantity` and `product_stock` were conflicting
- No single source of truth for inventory

**Solution:**
- Database triggers auto-sync stock changes
- `product_stock` is now source of truth
- `products.current_quantity` is calculated via SUM
- Real-time sync between tables

**Triggers:**
```sql
sync_stock_insert   - Updates product total on insert
sync_stock_update   - Updates product total on update
sync_stock_delete   - Updates product total on delete
```

### 9. **API Documentation**

**OpenAPI 3.0 Spec:**
- Auto-generated from code
- Available at `/openapi.json`
- All endpoints documented
- Request/response schemas
- Authentication methods

**Generate Docs:**
```bash
npm run openapi
# Creates: public/openapi.json
```

## 📊 New Database Schema

### Organizations
```sql
organizations      - Multi-tenant support
team_invitations  - Team member invites
```

### Sales
```sql
customers       - Customer management
sales            - Sales orders
sale_items       - Line items with COGS
```

### Products
```sql
product_variants - Size/color variants
product_bundles  - Product bundles/kits
bundle_items     - Bundle components
```

### Batches
```sql
product_batches        - Batch tracking
batch_stock_history    - Batch-level history
v_fifo_stock          - FIFO allocation view
v_batch_alerts        - Expiry alerts
```

### Audit
```sql
audit_logs       - Complete action log
```

## 🛠️ Migration Guide

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Migration
```bash
npm run migrate
```

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Generate API Docs (Optional)
```bash
npm run openapi
```

## 📋 Migration Checklist

- [x] Location data conflict fixed
- [x] Multi-user authentication added
- [x] Role-based permissions implemented
- [x] Team invitation system created
- [x] Sales tracking added
- [x] Customer management created
- [x] COGS tracking implemented
- [x] Product variants added
- [x] Product bundles added
- [x] Batch/expiry tracking implemented
- [x] FIFO allocation created
- [x] Audit trail system created
- [x] Backup/restore system added
- [x] Data export system added
- [x] API documentation generated

## 🔧 Technical Details

### New Helper Functions

**Location/Stock:**
```javascript
getProductTotalQuantity()          - Sum across all locations
getProductQuantityAtLocation()      - Location-specific quantity
updateProductQuantityAtLocation()   - Update with auto-sync
```

**Batch Tracking:**
```javascript
createBatch()                    - Create with validation
allocateStockFromBatches()        - FIFO stock allocation
getExpiringBatches(days)         - Get expiring items
```

**Audit:**
```javascript
AuditService.logAction()         - Log any action
AuditService.getOrganizationLogs()  - Get filtered logs
AuditService.getResourceLogs()       - Resource history
AuditService.cleanOldLogs()       - Retention cleanup
```

### Database Views

```sql
v_product_totals   - Aggregate quantities across locations
v_fifo_stock       - FIFO-ordered batch allocation
v_batch_alerts     - Expiring/expired batches
```

## 📦 Package.json Scripts

```json
{
  "migrate": "node scripts/migrate.js",
  "openapi": "node -r ts-node/register src/lib/openapi.ts"
}
```

## 🎯 User Type Support

| User Type | New Capabilities |
|-----------|-----------------|
| **Retail Stores** | ✓ Sales tracking<br>✓ Product variants<br>✓ Batch expiry tracking |
| **Restaurants** | ✓ Batch/exppiry dates<br>✓ COGS tracking<br>✓ FIFO allocation |
| **E-commerce** | ✓ Sales/revenue tracking<br>✓ Customer management<br>✓ Inventory sync<br>✓ Data export (CSV/JSON) |
| **Multi-Location** | ✓ Location data fixed<br>✓ User permissions<br>✓ Team collaboration |
| **Team Businesses** | ✓ Multi-user auth<br>✓ Role-based access<br>✓ Audit trails |
| **Enterprise** | ✓ Comprehensive audit<br>✓ API documentation<br>✓ Backup system |

## 📝 Post-Migration Tasks

1. **Test Team Invitations**
   - Create admin user
   - Invite team member with editor role
   - Verify permissions

2. **Test Sales Flow**
   - Create customer
   - Create sale with items
   - Verify COGS calculation
   - Check stock deduction

3. **Test Batch Tracking**
   - Create product with batches
   - Set expiry dates
   - Create sale (check FIFO allocation)
   - Verify expiry alerts

4. **Test Backup/Restore**
   - Export full backup
   - Delete some test data
   - Restore from backup
   - Verify data integrity

5. **Generate API Docs**
   - Run `npm run openapi`
   - Review `/openapi.json`
   - Import into Swagger/OpenAPI tools

## 🔒 Security Enhancements

1. **Audit Trail** - Every action logged with user, IP, timestamp
2. **Role-Based Access** - Granular permissions per action
3. **Team Invitations** - Time-limited tokens (48 hours)
4. **Transaction Safety** - Database transactions for critical operations
5. **Data Validation** - Email format, role validation, input sanitization

## 📊 Feature Comparison

| Feature | v1.0 | v2.0 |
|---------|-------|-------|
| Users | Single | Multi-user with teams |
| Authentication | Cookie-based | + Roles + Organizations |
| Sales | None | Full order management + COGS |
| Customers | None | Complete CRM |
| Product Variants | None | Size/color + bundles |
| Batch Tracking | None | FIFO + expiry dates |
| Audit Trail | Partial stock history | Complete action log |
| Backup/Export | None | Full backup + CSV/JSON export |
| API Docs | None | OpenAPI 3.0 spec |
| Permissions | None | Role-based access control |

## 🚀 Next Steps (Optional Enhancements)

1. **Email Notifications** - Send invitations and expiry alerts via email
2. **SMS Alerts** - Text notifications for low stock
3. **Scheduled Backups** - Automated daily/weekly backups
4. **Analytics Dashboard** - Charts/trends using recharts
5. **Mobile App** - React Native for native mobile experience
6. **Webhooks** - External system integrations
7. **Advanced Reports** - P&L, inventory turnover, forecasting
8. **Barcode Bulk Import** - CSV import for products

## 📞 Support

For issues or questions:
1. Check migration logs
2. Verify database schema: `sqlite3 data/dksstockalert.db .schema`
3. Review audit logs: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20`

## 📜 Changelog

### v2.0.0 - Enterprise Edition
- ✅ Multi-user authentication with organizations
- ✅ Team management with invitations and roles
- ✅ Sales tracking with customers and COGS
- ✅ Product variants (size/color) and bundles
- ✅ Batch/exppiry tracking with FIFO allocation
- ✅ Comprehensive audit trail system
- ✅ Data backup and restore (JSON/SQL)
- ✅ Data export (CSV/JSON) with filtering
- ✅ OpenAPI 3.0 documentation
- ✅ Location data conflict fix with auto-sync triggers
- ✅ Role-based access control (Owner/Admin/Editor/Viewer)
