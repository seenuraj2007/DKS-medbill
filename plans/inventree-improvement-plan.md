# DKS StockAlert Improvement Plan
## Based on InvenTree Analysis

This document outlines a comprehensive improvement plan for DKS StockAlert, inspired by InvenTree's mature inventory management features and architecture patterns.

---

## Executive Summary

InvenTree is a Python/Django-based open-source inventory management system with advanced features for parts management, BOM tracking, serial/batch tracking, and manufacturing support. This plan identifies key improvements to enhance DKS StockAlert's capabilities while maintaining its focus on Indian SMBs.

---

## Current State Analysis

### DKS StockAlert Strengths
- Modern Next.js 16 + TypeScript stack
- Multi-tenant architecture
- WhatsApp alerts integration
- Tally ERP import
- GST-compliant invoicing
- Multi-location inventory
- Role-based access control

### Gaps Compared to InvenTree
- No serial number/batch tracking
- No BOM (Bill of Materials) support
- Limited supplier management
- No stock take/inventory counting
- No label printing system
- Limited API for third-party integrations
- No plugin/extension system

---

## Improvement Roadmap

### Phase 1: Core Inventory Enhancements

#### 1.1 Serial Number Tracking
**Priority: HIGH**

Track individual items by serial number for warranty, quality control, and traceability.

**Database Changes:**
```prisma
model SerialNumber {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  productId     String   @map("product_id")
  stockLevelId  String   @map("stock_level_id")
  serialNumber  String   @map("serial_number")
  status        SerialStatus @default(IN_STOCK)
  warrantyExpiry DateTime? @map("warranty_expiry")
  notes         String?  @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant    Tenant     @relation(fields: [tenantId], references: [id])
  product   Product    @relation(fields: [productId], references: [id])
  stockLevel StockLevel @relation(fields: [stockLevelId], references: [id])

  @@unique([tenantId, productId, serialNumber])
  @@map("serial_numbers")
}

enum SerialStatus {
  IN_STOCK
  SOLD
  RESERVED
  DEFECTIVE
  RETURNED
}
```

**UI Components:**
- Serial number entry during stock receipt
- Serial number lookup/search
- Serial number selection during sales/transfer

---

#### 1.2 Batch/Lot Tracking
**Priority: HIGH**

Track inventory by batches with expiry dates for pharmaceuticals, food, and regulated industries.

**Database Changes:**
```prisma
model Batch {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  productId     String   @map("product_id")
  batchNumber   String   @map("batch_number")
  manufacturingDate DateTime? @map("manufacturing_date")
  expiryDate    DateTime? @map("expiry_date")
  quantity      Int      @default(0)
  locationId    String   @map("location_id")
  notes         String?  @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  product   Product   @relation(fields: [productId], references: [id])
  location  Location  @relation(fields: [locationId], references: [id])

  @@unique([tenantId, productId, batchNumber])
  @@map("batches")
}
```

**Features:**
- FEFO (First Expiry First Out) picking logic
- Expiry alerts and notifications
- Batch-wise stock reports

---

#### 1.3 Stock Take / Inventory Counting
**Priority: HIGH**

Conduct periodic inventory counts and reconcile discrepancies.

**Database Changes:**
```prisma
model StockTake {
  id            String       @id @default(uuid())
  tenantId      String       @map("tenant_id")
  locationId    String       @map("location_id")
  status        StockTakeStatus @default(DRAFT)
  scheduledDate DateTime     @map("scheduled_date")
  completedDate DateTime?    @map("completed_date")
  createdBy     String       @map("created_by")
  notes         String?      @db.Text
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  tenant   Tenant        @relation(fields: [tenantId], references: [id])
  location Location      @relation(fields: [locationId], references: [id])
  items    StockTakeItem[]

  @@map("stock_takes")
}

model StockTakeItem {
  id              String   @id @default(uuid())
  stockTakeId     String   @map("stock_take_id")
  productId       String   @map("product_id")
  expectedQty     Int      @map("expected_qty")
  countedQty      Int?     @map("counted_qty")
  discrepancy     Int?     @computed
  notes           String?  @db.Text
  countedBy       String?  @map("counted_by")
  countedAt       DateTime? @map("counted_at")

  stockTake StockTake @relation(fields: [stockTakeId], references: [id], onDelete: Cascade)
  product   Product   @relation(fields: [productId], references: [id])

  @@map("stock_take_items")
}

enum StockTakeStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

**Features:**
- Create stock take sessions by location
- Mobile-friendly counting interface
- Variance reports and adjustments
- Approval workflow for adjustments

---

### Phase 2: Product & Supplier Management

#### 2.1 Enhanced Product Categories
**Priority: MEDIUM**

Hierarchical product categories with custom attributes.

**Database Changes:**
```prisma
model Category {
  id          String     @id @default(uuid())
  tenantId    String     @map("tenant_id")
  name        String
  parentId    String?    @map("parent_id")
  description String?    @db.Text
  imageUrl    String?    @map("image_url")
  attributes  Json?      // Custom attribute definitions
  sortOrder   Int        @default(0) @map("sort_order")
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  tenant  Tenant    @relation(fields: [tenantId], references: [id])
  parent  Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
  products Product[]

  @@unique([tenantId, name])
  @@map("categories")
}
```

---

#### 2.2 Enhanced Supplier Management
**Priority: MEDIUM**

Comprehensive supplier profiles with pricing, lead times, and performance tracking.

**Database Changes:**
```prisma
model Supplier {
  id              String   @id @default(uuid())
  tenantId        String   @map("tenant_id")
  name            String
  code            String?  @unique
  email           String?
  phone           String?
  website         String?
  address         String?  @db.Text
  city            String?
  state           String?
  country         String?
  pincode         String?
  gstNumber       String?  @map("gst_number")
  panNumber       String?  @map("pan_number")
  
  // Performance metrics
  rating          Decimal? @db.Decimal(3, 2)
  totalOrders     Int      @default(0) @map("total_orders")
  onTimeDelivery  Decimal? @map("on_time_delivery") @db.Decimal(5, 2)
  
  // Financial
  creditLimit     Decimal? @map("credit_limit") @db.Decimal(12, 2)
  creditDays      Int?     @map("credit_days")
  paymentTerms    String?  @map("payment_terms")
  
  notes           String?  @db.Text
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tenant        Tenant          @relation(fields: [tenantId], references: [id])
  products      SupplierProduct[]
  purchaseOrders PurchaseOrder[]

  @@unique([tenantId, name])
  @@map("suppliers")
}

model SupplierProduct {
  id            String   @id @default(uuid())
  tenantId      String   @map("tenant_id")
  supplierId    String   @map("supplier_id")
  productId     String   @map("product_id")
  supplierSku   String?  @map("supplier_sku")
  unitPrice     Decimal  @map("unit_price") @db.Decimal(12, 2)
  minOrderQty   Int      @default(1) @map("min_order_qty")
  leadTime      Int?     @map("lead_time") // in days
  isPreferred   Boolean  @default(false) @map("is_preferred")
  validFrom     DateTime @default(now()) @map("valid_from")
  validTo       DateTime? @map("valid_to")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant   Tenant   @relation(fields: [tenantId], references: [id])
  supplier Supplier @relation(fields: [supplierId], references: [id])
  product  Product  @relation(fields: [productId], references: [id])

  @@unique([tenantId, supplierId, productId])
  @@map("supplier_products")
}
```

---

### Phase 3: Manufacturing & BOM Support

#### 3.1 Bill of Materials (BOM)
**Priority: MEDIUM**

Define product compositions for manufacturing/assembly businesses.

**Database Changes:**
```prisma
model BOM {
  id            String     @id @default(uuid())
  tenantId      String     @map("tenant_id")
  productId     String     @map("product_id") // Finished product
  version       String     @default("1.0")
  quantity      Decimal    @default(1) @db.Decimal(10, 2)
  isActive      Boolean    @default(true) @map("is_active")
  notes         String?    @db.Text
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  tenant  Tenant      @relation(fields: [tenantId], references: [id])
  product Product     @relation(fields: [productId], references: [id])
  items   BOMItem[]

  @@unique([tenantId, productId, version])
  @@map("boms")
}

model BOMItem {
  id            String   @id @default(uuid())
  bomId         String   @map("bom_id")
  componentId   String   @map("component_id") // Raw material/component
  quantity      Decimal  @db.Decimal(10, 4)
  unit          String   @default("unit")
  notes         String?  @db.Text
  createdAt     DateTime @default(now())

  bom       BOM    @relation(fields: [bomId], references: [id], onDelete: Cascade)
  component Product @relation(fields: [componentId], references: [id])

  @@map("bom_items")
}
```

---

#### 3.2 Production/Build Orders
**Priority: LOW**

Manufacturing workflow for assembling products from BOMs.

**Database Changes:**
```prisma
model BuildOrder {
  id            String      @id @default(uuid())
  tenantId      String      @map("tenant_id")
  bomId         String      @map("bom_id")
  quantity      Decimal     @db.Decimal(10, 2)
  status        BuildStatus @default(PLANNED)
  locationId    String      @map("location_id")
  plannedDate   DateTime?   @map("planned_date")
  startedDate   DateTime?   @map("started_date")
  completedDate DateTime?   @map("completed_date")
  notes         String?     @db.Text
  createdBy     String      @map("created_by")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  tenant   Tenant   @relation(fields: [tenantId], references: [id])
  bom      BOM      @relation(fields: [bomId], references: [id])
  location Location @relation(fields: [locationId], references: [id])

  @@map("build_orders")
}

enum BuildStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

---

### Phase 4: API & Integration Enhancements

#### 4.1 RESTful API with OpenAPI Documentation
**Priority: HIGH**

Comprehensive API for third-party integrations.

**Implementation:**
- Generate OpenAPI 3.0 specification
- API key authentication
- Rate limiting per tenant
- Webhook support for events

**API Endpoints:**
```
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/:id
PUT    /api/v1/products/:id
DELETE /api/v1/products/:id

GET    /api/v1/stock-levels
POST   /api/v1/stock-adjustments
GET    /api/v1/stock-transfers

GET    /api/v1/purchase-orders
POST   /api/v1/purchase-orders

GET    /api/v1/invoices
POST   /api/v1/invoices
```

---

#### 4.2 Webhook System
**Priority: MEDIUM**

Event-driven notifications for external systems.

**Database Changes:**
```prisma
model Webhook {
  id          String       @id @default(uuid())
  tenantId    String       @map("tenant_id")
  name        String
  url         String
  secret      String
  events      WebhookEvent[]
  isActive    Boolean      @default(true) @map("is_active")
  lastTriggered DateTime?  @map("last_triggered")
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@map("webhooks")
}

enum WebhookEvent {
  STOCK_LOW
  STOCK_OUT
  STOCK_RECEIVED
  PURCHASE_ORDER_CREATED
  PURCHASE_ORDER_RECEIVED
  INVOICE_CREATED
  PRODUCT_CREATED
  PRODUCT_UPDATED
}
```

---

### Phase 5: Reporting & Analytics

#### 5.1 Advanced Reporting
**Priority: MEDIUM**

Comprehensive business intelligence reports.

**Reports to Add:**
- Stock valuation report (FIFO, LIFO, Weighted Average)
- Slow-moving/obsolete stock report
- Supplier performance report
- Sales analytics by product/category
- Profit margin analysis
- GST reports (GSTR-1, GSTR-3B compatible)
- Inventory turnover report

---

#### 5.2 Dashboard Enhancements
**Priority: MEDIUM**

Real-time KPIs and visualizations.

**Widgets:**
- Stock value trend chart
- Top selling products
- Low stock alerts summary
- Purchase order status
- Sales velocity
- Inventory aging

---

### Phase 6: Operational Features

#### 6.1 Label Printing System
**Priority: MEDIUM**

Generate and print barcode labels for products and locations.

**Features:**
- Customizable label templates
- Barcode formats: Code128, EAN-13, QR Code
- Bulk label printing
- Label preview
- Integration with thermal printers

---

#### 6.2 Document Templates
**Priority: MEDIUM**

Customizable templates for business documents.

**Templates:**
- Invoice templates
- Purchase order templates
- Delivery challan
- Quotation templates
- Credit note templates

---

#### 6.3 Audit Trail Enhancement
**Priority: HIGH**

Comprehensive activity logging for compliance.

**Database Changes:**
```prisma
model AuditLog {
  id          String   @id @default(uuid())
  tenantId    String   @map("tenant_id")
  userId      String?  @map("user_id")
  action      String
  entityType  String   @map("entity_type")
  entityId    String   @map("entity_id")
  oldValues   Json?    @map("old_values")
  newValues   Json?    @map("new_values")
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  createdAt   DateTime @default(now())

  tenant Tenant? @relation(fields: [tenantId], references: [id])

  @@index([tenantId, entityType, entityId])
  @@index([tenantId, createdAt])
  @@map("audit_logs")
}
```

---

### Phase 7: Mobile & Offline Support

#### 7.1 Progressive Web App Enhancement
**Priority: MEDIUM**

Improve offline capabilities for field operations.

**Features:**
- Offline stock counting
- Offline barcode scanning
- Background sync
- Push notifications

---

#### 7.2 Mobile App (Future)
**Priority: LOW**

Native mobile application for iOS and Android.

**Options:**
- React Native
- Flutter
- Capacitor (wrap existing PWA)

---

## Implementation Priority Matrix

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Serial Number Tracking | HIGH | Medium | High |
| Batch/Lot Tracking | HIGH | Medium | High |
| Stock Take | HIGH | High | High |
| RESTful API | HIGH | High | High |
| Audit Trail | HIGH | Medium | High |
| Enhanced Supplier Mgmt | MEDIUM | Medium | Medium |
| Product Categories | MEDIUM | Medium | Medium |
| Label Printing | MEDIUM | Medium | Medium |
| Webhooks | MEDIUM | Medium | Medium |
| Advanced Reports | MEDIUM | High | High |
| BOM Support | LOW | High | Medium |
| Build Orders | LOW | High | Low |
| Mobile App | LOW | Very High | Medium |

---

## Architecture Recommendations

### 1. Repository Pattern
Implement a clean repository pattern for data access, already started in `src/lib/repositories/`.

### 2. Service Layer
Add a service layer for business logic separation from API routes.

### 3. Event-Driven Architecture
Implement an event bus for decoupled modules:
- Stock events
- Order events
- Notification events

### 4. Caching Strategy
Add Redis caching for:
- Session management
- API rate limiting
- Frequently accessed data
- Real-time stock levels

### 5. Background Jobs
Implement job queues for:
- Report generation
- Bulk operations
- Email/WhatsApp notifications
- Data imports

---

## Technology Additions

| Technology | Purpose |
|------------|---------|
| Redis | Caching, sessions, rate limiting |
| BullMQ | Background job processing |
| PDFKit | PDF generation for reports |
| node-thermal-printer | Thermal label printing |
| jsbarcode | Barcode generation |
| qrcode | QR code generation |

---

## Next Steps

### Completed ✅
- Fixed POS/Billing page error handling and user experience
- Fixed white text visibility issues on white backgrounds (forced light mode)
- Improved loading states and empty states across all pages
- Stock take API endpoints already exist and functional

### Immediate Priority (Next 1-2 Weeks)

1. **Serial Number Tracking** - HIGH
   - Add `serial_numbers` table to schema
   - UI for scanning/entering serial numbers during stock receipt
   - Serial number validation during sales
   - Warranty tracking interface

2. **Batch/Lot Tracking** - HIGH
   - Add `batches` table to schema
   - Batch creation during stock receipt
   - FEFO (First Expiry First Out) picking logic
   - Expiry date alerts and notifications
   - Batch-wise stock reports

3. **Customers API Fix** - MEDIUM
   - Fix `/api/customers` endpoint (currently returns 404 in POS)
   - Create customers table and CRUD operations
   - Add customer selection to POS page

### Short-term (Next 3-4 Weeks)

4. **Enhanced Audit Trail** - HIGH
   - Implement comprehensive `audit_logs` table
   - Track all CRUD operations
   - Add audit log viewer in admin panel
   - IP address and user agent tracking

5. **Label Printing System** - MEDIUM
   - Barcode generation (Code128, EAN-13, QR Code)
   - Customizable label templates
   - Bulk label printing
   - Thermal printer integration support

6. **Advanced Reporting** - MEDIUM
   - Stock valuation report (FIFO, LIFO)
   - Slow-moving stock report
   - Sales analytics by product/category
   - GST compliance reports (GSTR-1, GSTR-3B)
   - Inventory turnover metrics

### Medium-term (1-2 Months)

7. **RESTful API v1** - MEDIUM
   - Complete OpenAPI 3.0 specification
   - API key authentication system
   - Rate limiting per tenant
   - API documentation portal

8. **Webhook System** - MEDIUM
   - Webhook configuration UI
   - Event: stock_low, stock_out, purchase_order_received
   - Retry logic for failed webhooks
   - Webhook delivery logs

9. **Enhanced Supplier Management** - MEDIUM
   - Supplier rating and performance tracking
   - Preferred supplier per product
   - Supplier price history
   - Lead time tracking

### Long-term (2-3 Months)

10. **Bill of Materials (BOM)** - LOW
    - BOM creation and versioning
    - Component management
    - BOM cost calculation
    - Where-used reports

11. **Production/Build Orders** - LOW
    - Manufacturing workflow
    - Raw material reservation
    - Production completion tracking
    - Cost of goods manufactured

12. **Mobile App** - LOW
    - React Native or Flutter evaluation
    - Offline stock counting
    - Barcode scanning
    - Push notifications

### Technical Debt & Improvements

- [ ] Add Redis caching for sessions and frequent queries
- [ ] Implement BullMQ for background jobs (reports, notifications)
- [ ] Add PDF generation for invoices and reports
- [ ] Implement proper error boundaries
- [ ] Add rate limiting to all API endpoints
- [ ] Database indexing optimization
- [ ] Add database seeding for development

---

## Current Sprint Focus

**Week 1-2:** Serial Number & Batch Tracking
- Schema updates
- UI components
- Integration with existing stock flow

**Week 3-4:** Customers API & Audit Trail
- Fix customer endpoints
- Comprehensive audit logging
- Admin audit viewer

**Week 5-6:** Reporting & Label Printing
- Report generation
- Barcode/label system
- Print templates

---

## Questions for Discussion

1. Which features should be prioritized for your specific use case?
2. Are there any regulatory requirements (FDA, ISO) that need consideration?
3. What third-party integrations are most important?
4. Is there a preference for implementing BOM support vs. other features?
5. Should we consider a plugin architecture for extensibility?
