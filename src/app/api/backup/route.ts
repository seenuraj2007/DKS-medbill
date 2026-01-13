import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'
import { format } from 'date-fns'

// GET /api/backup - Export data
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'
    const tables = searchParams.get('tables')?.split(',') || ['all']

    if (!['json', 'sql'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `stockalert-backup-${timestamp}.${format}`

    if (format === 'json') {
      return exportJSONBackup(user.organization_id, filename)
    } else {
      return exportSQLBackup(user.organization_id, filename, tables)
    }
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}

function exportJSONBackup(organizationId: number | null, filename: string) {
  const tables = [
    'products',
    'product_variants',
    'product_stock',
    'locations',
    'suppliers',
    'customers',
    'sales',
    'sale_items',
    'purchase_orders',
    'purchase_order_items',
    'stock_transfers',
    'stock_transfer_items',
    'stock_history',
    'alerts',
    'organizations'
  ]

  const backup: any = {
    version: '2.0',
    exported_at: new Date().toISOString(),
    organization_id: organizationId,
    data: {}
  }

  for (const table of tables) {
    try {
      let query = `SELECT * FROM ${table}`
      
      if (organizationId && ['organizations', 'users'].includes(table)) {
        continue // Skip system tables
      }

      if (organizationId && table !== 'organizations' && table !== 'users') {
        query += ` WHERE organization_id = ${organizationId}`
      }

      const rows = db.prepare(query).all()
      if (rows.length > 0) {
        backup.data[table] = rows
      }
    } catch (error) {
      console.log(`Could not export table ${table}:`, error)
    }
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function exportSQLBackup(organizationId: number | null, filename: string, tables: string[]) {
  const sqlStatements: string[] = []

  sqlStatements.push('-- StockAlert Database Backup')
  sqlStatements.push(`-- Generated: ${new Date().toISOString()}`)
  sqlStatements.push('-- Organization ID: ' + organizationId)
  sqlStatements.push('')

  const tablesToExport = tables.includes('all')
    ? ['products', 'product_stock', 'locations', 'suppliers', 'customers',
       'sales', 'sale_items', 'purchase_orders', 'purchase_order_items',
       'stock_transfers', 'stock_transfer_items', 'stock_history', 'alerts']
    : tables

  for (const table of tablesToExport) {
    try {
      const rows = db.prepare(`SELECT * FROM ${table}`).all()
      if (rows.length === 0) continue

      sqlStatements.push(`-- Data for table: ${table}`)
      sqlStatements.push('')

      for (const row of rows as any[]) {
        const columns = Object.keys(row as any)
        const values = columns.map((col: string) => {
          const value = (row as any)[col]
          if (value === null) return 'NULL'
          if (typeof value === 'number') return value.toString()
          if (typeof value === 'boolean') return value ? '1' : '0'
          return `'${value.toString().replace(/'/g, "''")}'`
        }).join(', ')

        sqlStatements.push(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values});`)
      }

      sqlStatements.push('')
    } catch (error) {
      console.log(`Could not export table ${table}:`, error)
    }
  }

  return new NextResponse(sqlStatements.join('\n'), {
    headers: {
      'Content-Type': 'application/sql',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

// POST /api/backup - Restore data
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const content = await file.text()
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (extension === 'json') {
      return restoreJSONBackup(content, user)
    } else if (extension === 'sql') {
      return restoreSQLBackup(content, user)
    } else {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 })
    }
  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 })
  }
}

async function restoreJSONBackup(content: string, user: any) {
  try {
    const backup = JSON.parse(content)

    if (!backup.version) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 })
    }

    // Start transaction
    db.exec('BEGIN TRANSACTION')

    let restoredCount = 0
    const errors: string[] = []

    for (const [tableName, rows] of Object.entries(backup.data || {})) {
      if (!Array.isArray(rows)) continue

      try {
        for (const row of rows as any[]) {
          const columns = Object.keys(row)
          const placeholders = columns.map(() => '?').join(', ')
          const values = columns.map(col => row[col])

          const stmt = db.prepare(`
            INSERT OR REPLACE INTO ${tableName} (${columns.join(', ')})
            VALUES (${placeholders})
          `)
          stmt.run(...values)
          restoredCount++
        }
      } catch (error) {
        errors.push(`Failed to restore table ${tableName}: ${error}`)
      }
    }

    db.exec('COMMIT')

    return NextResponse.json({
      success: true,
      restoredCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

async function restoreSQLBackup(content: string, user: any) {
  try {
    const statements = content
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    db.exec('BEGIN TRANSACTION')

    let restoredCount = 0
    const errors: string[] = []

    for (const stmt of statements) {
      try {
        db.prepare(stmt).run()
        restoredCount++
      } catch (error) {
        errors.push(`${stmt.substring(0, 50)}...: ${error}`)
      }
    }

    db.exec('COMMIT')

    return NextResponse.json({
      success: true,
      restoredCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
