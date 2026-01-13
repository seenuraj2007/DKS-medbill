import db from './db'

export function runMigrations() {
  try {
    db.transaction(() => {
      const locations = db.prepare('SELECT COUNT(*) as count FROM locations').get() as { count: number }
      
      if (locations.count === 0) {
        const users = db.prepare('SELECT id FROM users').all() as { id: number }[]
        
        users.forEach(user => {
          db.prepare(`
            INSERT INTO locations (user_id, name, address, is_primary)
            VALUES (?, ?, ?, 1)
          `).run(user.id, 'Default Location', 'Main warehouse')
        })
      }
      
      console.log('Migrations completed successfully')
    })()
  } catch (error) {
    console.error('Migration error:', error)
  }
}

runMigrations()
