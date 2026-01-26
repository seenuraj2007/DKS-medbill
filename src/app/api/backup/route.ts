import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

interface BackupData {
  version: string
  exported_at: string
  organization_id: string | null
  data: Record<string, unknown[]>
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'json'
    const tablesParam = searchParams.get('tables')
    const tables = tablesParam ? tablesParam.split(',') : ['products']

    if (!['json', 'sql'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `stockalert-backup-${timestamp}.${format}`

    if (format === 'json') {
      return exportJSONBackup(user.id, filename, tables)
    } else {
      return exportSQLBackup(user.id, filename, tables)
    }
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}

async function exportJSONBackup(userId: string, filename: string, tables: string[]) {
  const backup: BackupData = {
    version: '2.0',
    exported_at: new Date().toISOString(),
    organization_id: userId,
    data: {}
  }

  const validTables = tables.includes('all')
    ? ['products', 'locations', 'suppliers', 'customers', 'stock_history', 'alerts']
    : tables.filter(t => ['products', 'locations', 'suppliers', 'customers', 'stock_history', 'alerts'].includes(t))

  for (const table of validTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)

      if (!error && data && data.length > 0) {
        backup.data[table] = data
      }
    } catch (err) {
      console.log(`Could not export table ${table}:`, err)
    }
  }

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

async function exportSQLBackup(userId: string, filename: string, tables: string[]) {
  const sqlStatements: string[] = []

  sqlStatements.push('-- StockAlert Database Backup')
  sqlStatements.push(`-- Generated: ${new Date().toISOString()}`)
  sqlStatements.push('-- User ID: ' + userId)
  sqlStatements.push('')

  const validTables = tables.includes('all')
    ? ['products', 'locations', 'suppliers', 'customers', 'stock_history', 'alerts']
    : tables.filter(t => ['products', 'locations', 'suppliers', 'customers', 'stock_history', 'alerts'].includes(t))

  for (const table of validTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)

      if (error || !data || data.length === 0) continue

      sqlStatements.push(`-- Data for table: ${table}`)
      sqlStatements.push('')

      for (const row of data) {
        const columns = Object.keys(row)
        const values = columns.map((col: string) => {
          const value = row[col as keyof typeof row]
          if (value === null) return 'NULL'
          if (typeof value === 'number') return value.toString()
          if (typeof value === 'boolean') return value ? 'true' : 'false'
          if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`
          return `'${value.toString().replace(/'/g, "''")}'`
        }).join(', ')

        sqlStatements.push(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values});`)
      }

      sqlStatements.push('')
    } catch (err) {
      console.log(`Could not export table ${table}:`, err)
    }
  }

  return new NextResponse(sqlStatements.join('\n'), {
    headers: {
      'Content-Type': 'application/sql',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

export async function POST() {
  return NextResponse.json({ error: 'Restore functionality not available in Supabase mode' }, { status: 501 })
}
