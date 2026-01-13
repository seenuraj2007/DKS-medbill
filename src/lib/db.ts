import Database from 'better-sqlite3'
import { join } from 'path'

const dbPath = join(process.cwd(), 'data', 'stockalert.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    country TEXT,
    is_primary INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL DEFAULT 0,
    supplier_name TEXT,
    supplier_email TEXT,
    supplier_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS stock_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('add', 'remove', 'restock')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    is_sent INTEGER DEFAULT 0,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
  CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
  CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
  CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(is_read);
  CREATE INDEX IF NOT EXISTS idx_locations_user ON locations(user_id);
  CREATE INDEX IF NOT EXISTS idx_suppliers_user ON suppliers(user_id);
`)

function addColumnIfNotExists(tableName: string, columnName: string, columnDefinition: string) {
  try {
    const result = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[]
    const columnExists = result.some(col => col.name === columnName)
    
    if (!columnExists) {
      db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`).run()
      console.log(`Added column ${columnName} to table ${tableName}`)
    }
  } catch (error) {
    console.log(`Column ${columnName} may already exist in table ${tableName}`)
  }
}

addColumnIfNotExists('products', 'barcode', 'TEXT')
addColumnIfNotExists('products', 'supplier_id', 'INTEGER')
addColumnIfNotExists('products', 'unit_cost', 'REAL DEFAULT 0')
addColumnIfNotExists('products', 'selling_price', 'REAL DEFAULT 0')
addColumnIfNotExists('products', 'unit', "TEXT DEFAULT 'unit'")
addColumnIfNotExists('products', 'image_url', 'TEXT')

addColumnIfNotExists('stock_history', 'location_id', 'INTEGER')
addColumnIfNotExists('stock_history', 'reference_id', 'INTEGER')
addColumnIfNotExists('stock_history', 'reference_type', 'TEXT')
addColumnIfNotExists('stock_history', 'change_type', "TEXT CHECK (change_type IN ('add', 'remove', 'restock', 'transfer_in', 'transfer_out'))")

addColumnIfNotExists('alerts', 'location_id', 'INTEGER')
addColumnIfNotExists('alerts', 'alert_type', "TEXT CHECK (alert_type IN ('low_stock', 'out_of_stock', 'purchase_order'))")
addColumnIfNotExists('alerts', 'reference_id', 'INTEGER')
addColumnIfNotExists('alerts', 'reference_type', 'TEXT')

db.exec(`
  CREATE TABLE IF NOT EXISTS product_stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    UNIQUE(product_id, location_id)
  );

  CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    supplier_id INTEGER NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'received', 'cancelled')),
    total_cost REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost REAL NOT NULL,
    total_cost REAL NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS stock_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    from_location_id INTEGER NOT NULL,
    to_location_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS stock_transfer_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stock_transfer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stock_transfer_id) REFERENCES stock_transfers(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
  CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
  CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
  CREATE INDEX IF NOT EXISTS idx_product_stock_product ON product_stock(product_id);
  CREATE INDEX IF NOT EXISTS idx_product_stock_location ON product_stock(location_id);
  CREATE INDEX IF NOT EXISTS idx_stock_history_location ON stock_history(location_id);
  CREATE INDEX IF NOT EXISTS idx_stock_history_date ON stock_history(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_purchase_orders_user ON purchase_orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
  CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
  CREATE INDEX IF NOT EXISTS idx_stock_transfers_user ON stock_transfers(user_id);
  CREATE INDEX IF NOT EXISTS idx_stock_transfers_from ON stock_transfers(from_location_id);
  CREATE INDEX IF NOT EXISTS idx_stock_transfers_to ON stock_transfers(to_location_id);
  CREATE INDEX IF NOT EXISTS idx_alerts_reference ON alerts(reference_id, reference_type);
`)

const users = db.prepare('SELECT id FROM users').all() as { id: number }[]

users.forEach(user => {
  const existingLocation = db.prepare('SELECT id FROM locations WHERE user_id = ?').get(user.id)
  if (!existingLocation) {
    db.prepare(`
      INSERT INTO locations (user_id, name, address, is_primary)
      VALUES (?, ?, ?, 1)
    `).run(user.id, 'Default Location', 'Main warehouse')
  }
})

// Helper function to get total product quantity across all locations
export function getProductTotalQuantity(productId: number): number {
  const result = db.prepare(`
    SELECT COALESCE(SUM(quantity), 0) as total
    FROM product_stock
    WHERE product_id = ?
  `).get(productId) as { total: number }
  return result.total
}

// Helper function to get product quantity at specific location
export function getProductQuantityAtLocation(productId: number, locationId: number): number {
  const result = db.prepare(`
    SELECT COALESCE(quantity, 0) as qty
    FROM product_stock
    WHERE product_id = ? AND location_id = ?
  `).get(productId, locationId) as { qty: number } | undefined
  return result?.qty || 0
}

// Helper function to update product quantity at location
export function updateProductQuantityAtLocation(
  productId: number,
  locationId: number,
  change: number,
  userId: number | null = null
): number {
  const stmt = db.prepare(`
    INSERT INTO product_stock (product_id, location_id, quantity, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(product_id, location_id) DO UPDATE SET
      quantity = quantity + ?,
      updated_at = CURRENT_TIMESTAMP
  `)

  stmt.run(productId, locationId, change, change)

  return getProductQuantityAtLocation(productId, locationId)
}

export default db
