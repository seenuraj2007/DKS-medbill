# StockAlert

Simple inventory tracking and restock reminder system for small businesses.

## Features

- **Product Management**: Add, edit, and delete products with SKU, barcode, category, unit cost, selling price, and supplier information
- **Barcode/QR Scanning**: Scan barcodes and QR codes directly from camera to quickly populate product data
- **Location Management**: Manage multiple storage locations (warehouses, stores, etc.) with contact information
- **Supplier Management**: Track suppliers with contact details, addresses, and product associations
- **Purchase Orders**: Create and track purchase orders with multiple items, unit costs, and receipt tracking
- **Stock Transfers**: Move stock between locations with full transfer history and status tracking
- **Stock Tracking**: Real-time inventory levels with reorder point alerts
- **Smart Alerts**: Automatic notifications when stock runs low or is out
- **Stock History**: Complete log of all inventory changes
- **Dashboard**: Overview with key metrics and low-stock items
- **Local SQLite Database**: No external dependencies, runs completely offline
- **PWA Support**: Install as a mobile app for quick access (iOS & Android)

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Authentication**: Session-based with bcrypt for password hashing
- **PWA**: next-pwa for progressive web app capabilities
- **Icons**: Lucide React
- **Notifications**: Browser Notification API for alerts
- **Barcode Scanning**: html5-qrcode for camera-based barcode/QR scanning

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to stockalert directory:
```bash
cd stockalert
```

2. Install dependencies:
```bash
npm install
```

3. The data directory and SQLite database will be created automatically on first run.

4. Start development server:
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

## PWA Installation

### Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Click "Install" to add to desktop

### Mobile (Android)
1. Open the app in Chrome
2. Tap "Add to Home Screen" from menu
3. Confirm installation

### Mobile (iOS)
1. Open the app in Safari
2. Tap "Share" button
3. Scroll down and tap "Add to Home Screen"
4. Confirm installation

Once installed, the app will work offline and can be launched from the home screen like a native app.

## Usage

### 1. Create an Account

- Click **"Sign In"** button (top right)
- Click **"Create Account"** at bottom
- Enter:
  - Full Name (e.g., "John Doe")
  - Email (e.g., "john@example.com")
  - Password
- Click **"Create Account"**

You'll be redirected to Dashboard.

### 2. Add Products

### Method A: From Dashboard
1. Click **"Add Product"** button (top right)
2. Fill in form:
   - **Product Name** (required) - e.g., "Coffee Beans"
   - **SKU** (optional) - e.g., "CB-001"
   - **Category** (optional) - e.g., "Food & Beverages"
   - **Current Quantity** - e.g., "50" (how many units you have now)
   - **Reorder Point** - e.g., "10" (alert when stock drops below this)
   - **Supplier Info** (optional) - Name, Email, Phone
3. Click **"Add Product"**

### Method B: From Products Page
1. Go to **Products** page to see all items
2. Click **"Add Product"** button

### 2.5. Barcode/QR Code Scanning
When adding or editing a product, you can quickly populate the barcode field using camera:
1. Click the **scan icon** next to the Barcode field
2. Allow camera access when prompted
3. Point camera at barcode or QR code
4. Code is automatically populated in the field
5. Scanner closes automatically after successful scan

**Supported Formats:**
- All major barcode formats (UPC, EAN, Code 128, etc.)
- QR codes
- Data Matrix
- And more

**Tips:**
- Use in well-lit area for better scanning
- Hold camera steady and at appropriate distance
- Ensure barcode/QR code is clearly visible

### 3. Track Stock

### View All Products
- Go to Products page to see all items
- Search by name or SKU
- Filter by category
- See status badges:
  - 🟢 **In Stock** - Healthy inventory
  - 🟡 **Low Stock** - Below reorder point
  - 🔴 **Out of Stock** - Zero units

### Update Stock Levels
1. Click on any product to open details
2. Scroll to **"Update Stock"** section
3. Choose:
   - **Sold / Remove** - Items sold or used (decreases stock)
   - **Add** - Manually add stock (increases stock)
   - **Restock** - New shipment (increases stock)
4. Enter quantity
5. Add optional notes (e.g., "Sale #12345")
6. Click **"Update Stock"**

### 4. Monitor Alerts

### Automatic Alerts
The app creates alerts automatically when:
- Stock drops to **0** → "Out of Stock" alert
- Stock falls **below reorder point** → "Low Stock" alert

### PWA Notifications
When installed as PWA, you'll receive browser notifications for:
- Low stock alerts
- Out of stock alerts

### View Alerts
1. Click **Bell icon** in top navigation
2. View all alerts or filter **"Unread Only"**
3. Click on alert to view product
4. Mark alerts as read or unread

### Alert Settings
- Low stock alerts prevent duplicate notifications within 24 hours
- Out of stock alerts also have 24-hour cooldown

### 5. Dashboard Overview

### Key Metrics
- **Total Products** - All items in inventory
- **Low Stock Items** - Need attention soon
- **Out of Stock** - Immediate restock needed
- **Unread Alerts** - New notifications

### Quick Actions
- **Add New Product** - Go to product form
- **View All Products** - See complete inventory
- **Check Alerts** - Review notifications

## Example Workflow

**Cafe Owner Scenario:**

1. **Add Products:**
   - Coffee Beans (Current: 50, Reorder: 10)
   - Milk (Current: 20, Reorder: 5)
   - Sugar (Current: 30, Reorder: 8)

2. **Daily Sales:**
   - Update Coffee Beans: Remove 5 units (now 45)
   - Update Milk: Remove 3 units (now 17)
   - Update Sugar: Remove 2 units (now 28)

3. **Alerts Triggered:**
   - After several days, Milk drops to 4 (below reorder point of 5)
   - Automatic alert created: "Low stock alert for Milk: 4 (reorder at 5)"
   - PWA notification shown if app is installed

4. **Restock:**
   - Open Milk product
   - Update Stock: Restock 20 units (now 24)
   - Alert resolved

5. **Review History:**
   - See all sales and restocks over time

## Tips

- **Set appropriate reorder points** based on your sales velocity
- **Use notes** when updating stock for better tracking (e.g., "Daily sales")
- **Check alerts daily** to avoid stockouts
- **Categories help organize** - use meaningful names like "Electronics", "Food", "Office Supplies"
- **Install as PWA** on mobile for quick access and offline support

## Project Structure

```
stockalert/
├── src/
│   ├── app/
│   │   ├── api/                      # API endpoints
│   │   │   ├── auth/                # Authentication endpoints
│   │   │   ├── dashboard/            # Dashboard stats
│   │   │   ├── alerts/              # Alert management
│   │   │   ├── products/            # Product CRUD + history
│   │   │   ├── locations/           # Location CRUD
│   │   │   ├── suppliers/           # Supplier CRUD
│   │   │   ├── purchase-orders/     # Purchase order CRUD
│   │   │   ├── stock-transfers/     # Stock transfer CRUD
│   │   │   └── upload/             # File upload
│   │   ├── auth/                    # Login/signup pages
│   │   ├── dashboard/               # Main dashboard with navigation
│   │   ├── products/                # Product management pages
│   │   ├── locations/               # Location management pages
│   │   ├── suppliers/               # Supplier management pages
│   │   ├── purchase-orders/         # Purchase order pages
│   │   ├── stock-transfers/         # Stock transfer pages
│   │   ├── alerts/                  # Alerts page
│   │   ├── offline/                 # Offline fallback page
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── BarcodeScanner.tsx       # Barcode/QR scanner component
│   │   └── PWAInstallPrompt.tsx     # PWA install banner
│   ├── lib/
│   │   ├── db.ts                   # SQLite database setup
│   │   ├── auth.ts                 # Authentication helpers
│   │   └── notifications.ts         # PWA notification service
│   └── types/
│       ├── index.ts                # TypeScript interfaces
│       └── database.ts             # Database schema definitions
├── data/
│   └── stockalert.db            # SQLite database (created on first run)
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── service-worker.js         # Service worker for offline support
│   └── icon.svg               # PWA icon
└── package.json
```

## Database Schema

### Users
- id, email, password (hashed), full_name, created_at

### Products
- id, user_id, name, sku, barcode, category, unit_cost, selling_price, unit, image_url, current_quantity, reorder_point, supplier_id, supplier_name, supplier_email, supplier_phone, created_at, updated_at

### Product Stock (per location)
- id, product_id, location_id, quantity, created_at, updated_at

### Locations
- id, user_id, name, address, city, state, zip, country, contact_person, email, phone, is_primary, created_at, updated_at

### Suppliers
- id, user_id, name, contact_person, email, phone, address, city, state, zip, country, notes, created_at, updated_at

### Purchase Orders
- id, user_id, supplier_id, order_number, status (pending/sent/received/cancelled), total_cost, notes, created_at, updated_at

### Purchase Order Items
- id, purchase_order_id, product_id, quantity, unit_cost, total_cost, received_quantity, created_at

### Stock Transfers
- id, user_id, from_location_id, to_location_id, status (pending/in_transit/completed/cancelled), notes, created_at, updated_at

### Stock Transfer Items
- id, stock_transfer_id, product_id, quantity, created_at

### Stock History
- id, product_id, location_id, previous_quantity, quantity_change, new_quantity, change_type (add/remove/restock/transfer_in/transfer_out), notes, reference_id, reference_type, created_at

### Alerts
- id, user_id, product_id, location_id, alert_type (low_stock/out_of_stock/purchase_order), message, is_read, is_sent, sent_at, reference_id, reference_type, created_at

## Development

### Build for Production

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

## PWA Offline Support

The app supports offline functionality:
- Cached static assets (images, fonts)
- Offline fallback page
- Service worker for offline requests
- Works without internet connection after first load

## Future Enhancements

- Email notifications for alerts
- SMS alerts via Twilio
- Bulk barcode scanning
- Advanced supplier order management
- Sales analytics and reporting
- Multi-user team collaboration
- Data export (CSV, Excel)
- Mobile app (React Native)
- Push notifications (web push API)
- Inventory forecasting
- Low stock predictions

## License

MIT


