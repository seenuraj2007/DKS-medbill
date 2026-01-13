#!/usr/bin/env node

import { migrateLocationDataConflict } from './migrate-location'
import { migrateMultiUserSupport } from './migrate-multiuser'
import { migrateSalesAndCustomers } from './migrate-sales'
import { migrateProductVariants } from './migrate-variants'
import { migrateBatchTracking } from './migrate-batch'
import { migrateAuditTrail } from './audit'

const MIGRATIONS = [
  {
    name: 'Location Data Conflict Fix',
    version: '1.0',
    fn: migrateLocationDataConflict
  },
  {
    name: 'Multi-User Authentication',
    version: '2.0',
    fn: migrateMultiUserSupport
  },
  {
    name: 'Sales and Customers',
    version: '3.0',
    fn: migrateSalesAndCustomers
  },
  {
    name: 'Product Variants',
    version: '4.0',
    fn: migrateProductVariants
  },
  {
    name: 'Batch and Expiry Tracking',
    version: '5.0',
    fn: migrateBatchTracking
  },
  {
    name: 'Audit Trail',
    version: '6.0',
    fn: migrateAuditTrail
  }
]

function runMigration(migrationIndex: number) {
  console.log(`\n=== Running migration: ${MIGRATIONS[migrationIndex].name} (v${MIGRATIONS[migrationIndex].version}) ===`)
  
  try {
    MIGRATIONS[migrationIndex].fn()
    console.log(`✓ ${MIGRATIONS[migrationIndex].name} completed successfully`)
  } catch (error) {
    console.error(`✗ ${MIGRATIONS[migrationIndex].name} failed:`, error)
    process.exit(1)
  }
}

async function runAllMigrations() {
  console.log('\n=== Starting StockAlert Migrations ===')
  console.log(`Total migrations: ${MIGRATIONS.length}`)
  
  for (let i = 0; i < MIGRATIONS.length; i++) {
    runMigration(i)
  }
  
  console.log('\n=== All Migrations Completed Successfully ===\n')
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (command === 'all' || !command) {
    await runAllMigrations()
  } else if (command === 'list') {
    console.log('\nAvailable Migrations:')
    MIGRATIONS.forEach((m, i) => {
      console.log(`  ${i}. ${m.name} (v${m.version})`)
    })
    console.log()
  } else {
    const index = parseInt(command)
    if (isNaN(index) || index < 0 || index >= MIGRATIONS.length) {
      console.error('Invalid migration index. Use "list" to see available migrations.')
      process.exit(1)
    }
    runMigration(index)
  }
}

main()
