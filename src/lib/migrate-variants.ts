import db from './db'

export function migrateProductVariants() {
  try {
    console.log('Starting product variants migration...')

    // 1. Create product_variants table
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
    `)

    // 2. Create variant attributes options table (for dropdowns)
    db.exec(`
      CREATE TABLE IF NOT EXISTS variant_attributes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        values TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 3. Create product_bundles table (for kits/packs)
    db.exec(`
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
    `)

    // 4. Create bundle_items table
    db.exec(`
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

    // 5. Add variant support to products
    addColumnIfNotExists('products', 'has_variants', 'INTEGER DEFAULT 0')
    addColumnIfNotExists('products', 'is_bundle', 'INTEGER DEFAULT 0')

    // 6. Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
      CREATE INDEX IF NOT EXISTS idx_product_variants_barcode ON product_variants(barcode);
      CREATE INDEX IF NOT EXISTS idx_product_bundles_product ON product_bundles(product_id);
      CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
      CREATE INDEX IF NOT EXISTS idx_bundle_items_product ON bundle_items(product_id);
    `)

    // 7. Create view for variant stock tracking
    db.exec(`
      DROP VIEW IF EXISTS v_variant_stock;
      
      CREATE VIEW v_variant_stock AS
      SELECT 
        pv.id as variant_id,
        pv.product_id,
        pv.sku,
        pv.barcode,
        pv.variant_name,
        pv.variant_attributes,
        pv.unit_cost,
        pv.selling_price,
        pv.current_quantity,
        pv.reorder_point,
        pv.is_active,
        p.name as product_name,
        p.category as product_category,
        CASE 
          WHEN pv.current_quantity <= pv.reorder_point THEN 1
          ELSE 0
        END as needs_restock,
        CASE 
          WHEN pv.current_quantity = 0 THEN 1
          ELSE 0
        END as is_out_of_stock
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.is_active = 1
    `)

    console.log('Product variants migration completed successfully!')
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

// Helper function to create variant
export function createVariant(
  productId: number,
  data: {
    sku?: string
    barcode?: string
    variantName: string
    variantAttributes?: string
    unitCost?: number
    sellingPrice?: number
    currentQuantity?: number
    reorderPoint?: number
  }
): number {
  const result = db.prepare(`
    INSERT INTO product_variants (product_id, sku, barcode, variant_name, variant_attributes,
                                unit_cost, selling_price, current_quantity, reorder_point)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    productId,
    data.sku || null,
    data.barcode || null,
    data.variantName,
    data.variantAttributes || null,
    data.unitCost || 0,
    data.sellingPrice || 0,
    data.currentQuantity || 0,
    data.reorderPoint || 0
  )

  // Update parent product to indicate it has variants
  db.prepare('UPDATE products SET has_variants = 1 WHERE id = ?').run(productId)

  return result.lastInsertRowid as number
}

// Helper function to update variant stock
export function updateVariantStock(
  variantId: number,
  change: number,
  userId: number | null = null
): number {
  const current = db.prepare('SELECT current_quantity FROM product_variants WHERE id = ?').get(variantId) as any
  const newQuantity = Math.max(0, current.current_quantity + change)

  db.prepare(`
    UPDATE product_variants
    SET current_quantity = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(newQuantity, variantId)

  // Add to stock history
  const product = db.prepare('SELECT product_id FROM product_variants WHERE id = ?').get(variantId) as any
  db.prepare(`
    INSERT INTO stock_history (product_id, previous_quantity, quantity_change, new_quantity,
                              change_type, notes, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    product.product_id,
    current.current_quantity,
    change,
    newQuantity,
    change < 0 ? 'remove' : 'add',
    `Variant #${variantId}`,
    userId
  )

  return newQuantity
}

// Helper function to get all variants for a product
export function getProductVariants(productId: number) {
  return db.prepare(`
    SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1 ORDER BY variant_name
  `).all(productId)
}

// Run migration if executed directly
if (require.main === module) {
  migrateProductVariants()
}
