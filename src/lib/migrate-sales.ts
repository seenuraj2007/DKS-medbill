import db from './db'

export function migrateSalesAndCustomers() {
  try {
    console.log('Starting sales and customers migration...')

    // 1. Create customers table
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
    `)

    // 2. Create sales table
    db.exec(`
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
    `)

    // 3. Create sale_items table
    db.exec(`
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

    // 4. Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_customers_organization ON customers(organization_id);
      CREATE INDEX IF NOT EXISTS idx_sales_organization ON sales(organization_id);
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date DESC);
      CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
      CREATE INDEX IF NOT EXISTS idx_sales_user ON sales(user_id);
      CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
      CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(product_id);
    `)

    // 5. Add user_id to stock_history
    addColumnIfNotExists('stock_history', 'user_id', 'INTEGER')

    // 6. Add COGS tracking to products
    addColumnIfNotExists('products', 'total_cost_sold', 'REAL DEFAULT 0')
    addColumnIfNotExists('products', 'revenue', 'REAL DEFAULT 0')

    console.log('Sales and customers migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

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

// Run migration if executed directly
if (require.main === module) {
  migrateSalesAndCustomers()
}
