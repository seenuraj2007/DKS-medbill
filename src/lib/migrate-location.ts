import db from './db'
import { join } from 'path'

export function migrateLocationDataConflict() {
  try {
    console.log('Starting location data conflict migration...')

    // Add user_id to existing stock_history entries if missing
    try {
      const result = db.prepare('PRAGMA table_info(stock_history)').all() as any[]
      const hasUserId = result.some(col => col.name === 'user_id')
      
      if (!hasUserId) {
        db.prepare('ALTER TABLE stock_history ADD COLUMN user_id INTEGER').run()
        console.log('Added user_id to stock_history table')
      }
    } catch (error) {
      console.log('user_id may already exist in stock_history')
    }

    // 1. Create a new view to calculate total quantity across all locations
    db.exec(`
      DROP VIEW IF EXISTS v_product_totals;
      
      CREATE VIEW v_product_totals AS
      SELECT 
        p.id,
        p.user_id,
        p.name,
        p.sku,
        p.barcode,
        p.category,
        p.unit_cost,
        p.selling_price,
        p.unit,
        p.image_url,
        p.reorder_point,
        p.supplier_id,
        p.supplier_name,
        p.supplier_email,
        p.supplier_phone,
        COALESCE(SUM(ps.quantity), 0) as total_quantity,
        MIN(CASE WHEN l.is_primary = 1 THEN ps.quantity ELSE NULL END) as primary_location_quantity,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN product_stock ps ON p.id = ps.product_id
      LEFT JOIN locations l ON ps.location_id = l.id
      GROUP BY p.id
    `)

    console.log('Created v_product_totals view for total quantity calculations')

    // 2. Create triggers to automatically sync product_stock changes to products.current_quantity
    db.exec(`
      DROP TRIGGER IF EXISTS sync_stock_insert;
      DROP TRIGGER IF EXISTS sync_stock_update;
      DROP TRIGGER IF EXISTS sync_stock_delete;
    `)

    // Trigger on insert to product_stock
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
      END
    `)

    // Trigger on update to product_stock
    db.exec(`
      CREATE TRIGGER sync_stock_update
      AFTER UPDATE OF quantity ON product_stock
      BEGIN
        UPDATE products 
        SET current_quantity = (
          COALESCE((SELECT SUM(quantity) FROM product_stock WHERE product_id = NEW.product_id), 0)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.product_id;
      END
    `)

    // Trigger on delete from product_stock
    db.exec(`
      CREATE TRIGGER sync_stock_delete
      AFTER DELETE ON product_stock
      BEGIN
        UPDATE products 
        SET current_quantity = (
          COALESCE((SELECT SUM(quantity) FROM product_stock WHERE product_id = OLD.product_id), 0)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.product_id;
      END
    `)

    console.log('Created sync triggers between product_stock and products.current_quantity')

    // 3. Ensure all products have entries in product_stock for primary location
    const products = db.prepare(`
      SELECT p.id, l.id as location_id
      FROM products p
      CROSS JOIN locations l
      WHERE l.is_primary = 1 AND l.user_id = p.user_id
      AND NOT EXISTS (
        SELECT 1 FROM product_stock ps 
        WHERE ps.product_id = p.id AND ps.location_id = l.id
      )
    `).all() as { id: number, location_id: number }[]

    products.forEach(product => {
      db.prepare(`
        INSERT INTO product_stock (product_id, location_id, quantity)
        VALUES (?, ?, 0)
      `).run(product.id, product.location_id)
    })

    console.log(`Created ${products.length} missing product_stock entries`)

    // 4. Sync existing product_stock totals to products.current_quantity
    db.exec(`
      UPDATE products
      SET current_quantity = (
        COALESCE((SELECT SUM(quantity) FROM product_stock WHERE product_id = products.id), 0)
      )
      WHERE EXISTS (SELECT 1 FROM product_stock WHERE product_id = products.id)
    `)

    console.log('Synced existing product_stock data to products.current_quantity')

    console.log('Location data conflict migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export function rollbackLocationDataConflict() {
  try {
    console.log('Rolling back location data conflict migration...')

    db.exec(`
      DROP TRIGGER IF EXISTS sync_stock_insert;
      DROP TRIGGER IF EXISTS sync_stock_update;
      DROP TRIGGER IF EXISTS sync_stock_delete;
      DROP VIEW IF EXISTS v_product_totals;
    `)

    console.log('Rollback completed successfully!')
  } catch (error) {
    console.error('Rollback failed:', error)
    throw error
  }
}

// Run migration if executed directly
if (require.main === module) {
  const args = process.argv.slice(2)
  const action = args[0] || 'migrate'

  if (action === 'rollback') {
    rollbackLocationDataConflict()
  } else {
    migrateLocationDataConflict()
  }
}
