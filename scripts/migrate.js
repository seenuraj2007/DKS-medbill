#!/usr/bin/env node

import Database from 'better-sqlite3'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const dbPath = join(process.cwd(), 'data', 'stockalert.db')
const db = new Database(dbPath)

console.log('🚀 Starting StockAlert Migration to v2.0.0...\n')

// Migration 1: Location Data Conflict
console.log('✓ Migration 1: Fixing location data conflict...')

try {
  db.exec(`
    DROP TRIGGER IF EXISTS sync_stock_insert;
    DROP TRIGGER IF EXISTS sync_stock_update;
    DROP TRIGGER IF EXISTS sync_stock_delete;
  `)

  db.exec(`
    CREATE TRIGGER sync_stock_insert
    AFTER INSERT ON product_stock
    BEGIN
      UPDATE products 
        SET current_quantity = (
          COALESCE((SELECT SUM(quantity) FROM product_stock WHERE product_id = NEW.product_id), 0)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.product_id;
    END;

    CREATE TRIGGER sync_stock_update
    AFTER UPDATE OF quantity ON product_stock
    BEGIN
      UPDATE products 
        SET current_quantity = (
          COALESCE((SELECT SUM(quantity) FROM product_stock WHERE product_id = NEW.product_id), 0)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.product_id;
    END;

    CREATE TRIGGER sync_stock_delete
    AFTER DELETE ON product_stock
    BEGIN
      UPDATE products 
        SET current_quantity = (
          COALESCE((SELECT SUM(quantity) FROM product_stock WHERE product_id = OLD.product_id), 0)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.product_id;
    END;
  `)

  console.log('  ✓ Sync triggers created')
} catch (error) {
  console.log('  - May already exist:', error.message)
}

// Migration 2: Multi-User Support
console.log('✓ Migration 2: Adding multi-user authentication...')

try {
  db.exec(`
    ALTER TABLE users ADD COLUMN organization_id INTEGER;
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor', 'viewer'));
    ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive'));
    ALTER TABLE users ADD COLUMN invited_by INTEGER;
    ALTER TABLE users ADD COLUMN invitation_token TEXT;
    ALTER TABLE users ADD COLUMN invited_at DATETIME;
  `)
  console.log('  ✓ User columns added')
} catch (error) {
  console.log('  - May already exist:', error.message)
}

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS team_invitations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
      invited_by INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
  console.log('  ✓ Organization tables created')
} catch (error) {
  console.log('  - Tables may already exist')
}

// Create default organizations for existing users
const existingUsers = db.prepare('SELECT id, full_name FROM users WHERE organization_id IS NULL').all()
for (const user of existingUsers) {
  const orgName = user.full_name ? `${user.full_name}'s Organization` : 'My Organization'
  const orgResult = db.prepare('INSERT INTO organizations (name, owner_id) VALUES (?, ?)').run(orgName, user.id)
  const orgId = orgResult.lastInsertRowid
  db.prepare('UPDATE users SET organization_id = ?, role = \'owner\' WHERE id = ?').run(orgId, user.id)
  console.log(`  ✓ Created organization for user ${user.id}`)
}

// Migration 3: Sales and Customers
console.log('✓ Migration 3: Adding sales and customers...')

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      organization_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      country TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      organization_id INTEGER NOT NULL,
      customer_id INTEGER,
      sale_number TEXT UNIQUE NOT NULL,
      sale_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      subtotal REAL NOT NULL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending', 'refunded', 'partial')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount REAL DEFAULT 0,
      total_price REAL NOT NULL,
      cost_of_goods REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `)
  console.log('  ✓ Sales tables created')
} catch (error) {
  console.log('  - Tables may already exist')
}

try {
  db.exec('ALTER TABLE stock_history ADD COLUMN user_id INTEGER')
  db.exec('ALTER TABLE products ADD COLUMN total_cost_sold REAL DEFAULT 0')
  db.exec('ALTER TABLE products ADD COLUMN revenue REAL DEFAULT 0')
  console.log('  ✓ COGS columns added')
} catch (error) {
  console.log('  - Columns may already exist')
}

// Migration 4: Product Variants
console.log('✓ Migration 4: Adding product variants...')

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      sku TEXT,
      barcode TEXT,
      variant_name TEXT NOT NULL,
      variant_attributes TEXT,
      unit_cost REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      current_quantity INTEGER NOT NULL DEFAULT 0,
      reorder_point INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(product_id, sku),
      UNIQUE(product_id, barcode)
    );

    CREATE TABLE IF NOT EXISTS product_bundles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      bundle_name TEXT NOT NULL,
      discount_percentage REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bundle_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bundle_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bundle_id) REFERENCES product_bundles(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
    );
  `)
  console.log('  ✓ Variant tables created')
} catch (error) {
  console.log('  - Tables may already exist')
}

try {
  db.exec('ALTER TABLE products ADD COLUMN has_variants INTEGER DEFAULT 0')
  db.exec('ALTER TABLE products ADD COLUMN is_bundle INTEGER DEFAULT 0')
  console.log('  ✓ Variant columns added')
} catch (error) {
  console.log('  - Columns may already exist')
}

// Migration 5: Batch and Expiry Tracking
console.log('✓ Migration 5: Adding batch/exppiry tracking...')

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_batches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      location_id INTEGER,
      batch_number TEXT NOT NULL,
      expiry_date DATE,
      manufacturing_date DATE,
      initial_quantity INTEGER NOT NULL DEFAULT 0,
      current_quantity INTEGER NOT NULL DEFAULT 0,
      unit_cost REAL DEFAULT 0,
      supplier_id INTEGER,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS batch_stock_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      batch_id INTEGER NOT NULL,
      previous_quantity INTEGER NOT NULL,
      quantity_change INTEGER NOT NULL,
      new_quantity INTEGER NOT NULL,
      change_type TEXT NOT NULL CHECK (change_type IN ('sale', 'transfer_out', 'transfer_in', 'adjustment', 'expiry_loss', 'damage')),
      reference_id INTEGER,
      reference_type TEXT,
      notes TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (batch_id) REFERENCES product_batches(id) ON DELETE CASCADE
    );
  `)
  console.log('  ✓ Batch tables created')
} catch (error) {
  console.log('  - Tables may already exist')
}

try {
  db.exec('ALTER TABLE products ADD COLUMN track_batches INTEGER DEFAULT 0')
  console.log('  ✓ Batch tracking column added')
} catch (error) {
  console.log('  - Column may already exist')
}

// Migration 6: Audit Trail
console.log('✓ Migration 6: Adding audit trails...')

try {
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
  console.log('  ✓ Audit logs table created')
} catch (error) {
  console.log('  - Table may already exist')
}

// Sync existing data
console.log('✓ Syncing existing product stock data...')
db.exec(`
  UPDATE products
  SET current_quantity = (
    COALESCE((SELECT SUM(quantity) FROM product_stock WHERE product_id = products.id), 0)
  )
  WHERE EXISTS (SELECT 1 FROM product_stock WHERE product_id = products.id)
`)

console.log('\n✅ All migrations completed successfully!\n')
console.log('Next steps:')
console.log('1. Restart the development server: npm run dev')
console.log('2. Generate API docs: npm run openapi')
console.log('3. Test the new features\n')
