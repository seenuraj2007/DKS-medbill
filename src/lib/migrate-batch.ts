import db from './db'

export function migrateBatchTracking() {
  try {
    console.log('Starting batch/expiry tracking migration...')

    // 1. Create product_batches table
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
    `)

    // 2. Create batch_stock_history table
    db.exec(`
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

    // 3. Add batch support flag to products
    addColumnIfNotExists('products', 'track_batches', 'INTEGER DEFAULT 0')

    // 4. Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_product_batches_product ON product_batches(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_batches_variant ON product_batches(variant_id);
      CREATE INDEX IF NOT EXISTS idx_product_batches_location ON product_batches(location_id);
      CREATE INDEX IF NOT EXISTS idx_product_batches_batch ON product_batches(batch_number);
      CREATE INDEX IF NOT EXISTS idx_product_batches_expiry ON product_batches(expiry_date);
      CREATE INDEX IF NOT EXISTS idx_product_batches_active ON product_batches(is_active, current_quantity);
      CREATE INDEX IF NOT EXISTS idx_batch_stock_history_batch ON batch_stock_history(batch_id);
    `)

    // 5. Create view for FIFO stock allocation
    db.exec(`
      DROP VIEW IF EXISTS v_fifo_stock;
      
      CREATE VIEW v_fifo_stock AS
      SELECT 
        pb.id,
        pb.product_id,
        pb.variant_id,
        pb.location_id,
        pb.batch_number,
        pb.expiry_date,
        pb.manufacturing_date,
        pb.current_quantity,
        pb.unit_cost,
        CASE 
          WHEN pb.expiry_date IS NOT NULL 
            AND date(pb.expiry_date) < date('now', '+7 days') 
            AND pb.current_quantity > 0 THEN 1
          ELSE 0
        END as expiring_soon,
        CASE 
          WHEN pb.expiry_date IS NOT NULL 
            AND date(pb.expiry_date) < date('now') 
            AND pb.current_quantity > 0 THEN 1
          ELSE 0
        END as is_expired,
        ROW_NUMBER() OVER (
          PARTITION BY pb.product_id, pb.location_id, COALESCE(pb.variant_id, 0)
          ORDER BY 
            CASE 
              WHEN pb.expiry_date IS NULL THEN 9999999999
              ELSE pb.expiry_date
            END ASC,
            pb.created_at ASC
        ) as fifo_order
      FROM product_batches pb
      WHERE pb.is_active = 1
    `)

    // 6. Create view for expired/expiring batches
    db.exec(`
      DROP VIEW IF EXISTS v_batch_alerts;
      
      CREATE VIEW v_batch_alerts AS
      SELECT 
        pb.id,
        pb.product_id,
        p.name as product_name,
        p.sku,
        pb.batch_number,
        pb.expiry_date,
        pb.current_quantity,
        pb.unit_cost,
        (pb.current_quantity * pb.unit_cost) as potential_loss,
        l.name as location_name,
        CASE 
          WHEN pb.expiry_date IS NOT NULL 
            AND date(pb.expiry_date) < date('now', '+7 days') 
            AND pb.current_quantity > 0 THEN 'expiring_soon'
          WHEN pb.expiry_date IS NOT NULL 
            AND date(pb.expiry_date) < date('now') 
            AND pb.current_quantity > 0 THEN 'expired'
          ELSE 'ok'
        END as alert_type
      FROM product_batches pb
      JOIN products p ON pb.product_id = p.id
      LEFT JOIN locations l ON pb.location_id = l.id
      WHERE pb.is_active = 1
        AND pb.current_quantity > 0
        AND (
          (pb.expiry_date IS NOT NULL AND date(pb.expiry_date) < date('now', '+30 days'))
        )
      ORDER BY pb.expiry_date ASC
    `)

    console.log('Batch/expiry tracking migration completed successfully!')
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

// Helper function to create new batch
export function createBatch(
  productId: number,
  data: {
    variantId?: number
    locationId?: number
    batchNumber: string
    expiryDate?: string
    manufacturingDate?: string
    initialQuantity: number
    unitCost?: number
    supplierId?: number
    notes?: string
  }
): number {
  const result = db.prepare(`
    INSERT INTO product_batches (product_id, variant_id, location_id, batch_number, 
                              expiry_date, manufacturing_date, initial_quantity, 
                              current_quantity, unit_cost, supplier_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    productId,
    data.variantId || null,
    data.locationId || null,
    data.batchNumber,
    data.expiryDate || null,
    data.manufacturingDate || null,
    data.initialQuantity,
    data.initialQuantity,
    data.unitCost || 0,
    data.supplierId || null,
    data.notes || null
  )

  // Update product to indicate batch tracking
  db.prepare('UPDATE products SET track_batches = 1 WHERE id = ?').run(productId)

  return result.lastInsertRowid as number
}

// Helper function to allocate stock from batches (FIFO)
export function allocateStockFromBatches(
  productId: number,
  locationId: number,
  quantityNeeded: number,
  userId: number | null = null
): { success: boolean, allocations: any[] } {
  const allocations: any[] = []
  let remaining = quantityNeeded

  // Get batches in FIFO order
  const batches = db.prepare(`
    SELECT * FROM v_fifo_stock
    WHERE product_id = ? 
      AND location_id = ?
      AND current_quantity > 0
    ORDER BY fifo_order ASC
  `).all(productId, locationId) as any[]

  for (const batch of batches) {
    if (remaining <= 0) break

    const quantityToDeduct = Math.min(remaining, batch.current_quantity)

    // Deduct from batch
    db.prepare(`
      UPDATE product_batches
      SET current_quantity = current_quantity - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(quantityToDeduct, batch.id)

    // Record history
    db.prepare(`
      INSERT INTO batch_stock_history (batch_id, previous_quantity, quantity_change, new_quantity,
                                    change_type, reference_id, reference_type, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      batch.id,
      batch.current_quantity,
      -quantityToDeduct,
      batch.current_quantity - quantityToDeduct,
      'sale',
      null,
      null,
      userId
    )

    allocations.push({
      batchId: batch.id,
      batchNumber: batch.batch_number,
      quantity: quantityToDeduct,
      unitCost: batch.unit_cost,
      expiryDate: batch.expiry_date
    })

    remaining -= quantityToDeduct
  }

  // Update product current quantity
  const totalAllocated = quantityNeeded - remaining
  if (totalAllocated > 0) {
    const product = db.prepare('SELECT current_quantity FROM products WHERE id = ?').get(productId) as any
    db.prepare(`
      UPDATE products
      SET current_quantity = current_quantity - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(totalAllocated, productId)
  }

  return {
    success: remaining === 0,
    allocations
  }
}

// Helper function to get expiring batches
export function getExpiringBatches(daysThreshold: number = 30) {
  return db.prepare(`
    SELECT * FROM v_batch_alerts
    WHERE alert_type IN ('expired', 'expiring_soon')
    ORDER BY expiry_date ASC
  `).all()
}

// Run migration if executed directly
if (require.main === module) {
  migrateBatchTracking()
}
