import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

// GET /api/export - Export data in various formats
export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'csv'
    const table = searchParams.get('table') || 'products'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!['csv', 'json'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    const validTables = ['products', 'sales', 'customers', 'suppliers', 'locations',
                        'purchase_orders', 'stock_transfers', 'inventory']
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `stockalert-${table}-${timestamp}.${format}`

    if (table === 'inventory') {
      return exportInventory(user.organization_id, startDate, endDate, format, filename)
    } else {
      return exportTable(user.organization_id, table, startDate, endDate, format, filename)
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

function exportInventory(organizationId: number | null, startDate: string | null, 
                     endDate: string | null, format: string, filename: string) {
  let query = `
    SELECT 
      p.id,
      p.name,
      p.sku,
      p.barcode,
      p.category,
      p.current_quantity,
      p.reorder_point,
      p.unit_cost,
      p.selling_price,
      (p.current_quantity * p.selling_price) as total_value,
      p.supplier_name,
      l.name as location,
      CASE 
        WHEN p.current_quantity = 0 THEN 'Out of Stock'
        WHEN p.current_quantity <= p.reorder_point THEN 'Low Stock'
        ELSE 'In Stock'
      END as status
    FROM products p
    LEFT JOIN product_stock ps ON p.id = ps.product_id
    LEFT JOIN locations l ON ps.location_id = l.id
    WHERE p.organization_id = ?
      AND l.is_primary = 1
  `
  
  const params: any[] = [organizationId]
  if (startDate) {
    query += ' AND p.updated_at >= ?'
    params.push(startDate)
  }
  if (endDate) {
    query += ' AND p.updated_at <= ?'
    params.push(endDate)
  }

  const rows = db.prepare(query).all(...params)

  if (format === 'json') {
    return new NextResponse(JSON.stringify(rows, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  const headers = ['ID', 'Name', 'SKU', 'Barcode', 'Category', 'Quantity',
                  'Reorder Point', 'Unit Cost', 'Selling Price', 'Total Value',
                  'Supplier', 'Location', 'Status']
  const csv = convertToCSV(rows, headers)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function exportTable(organizationId: number | null, table: string,
                   startDate: string | null, endDate: string | null,
                   format: string, filename: string) {
  let query = `SELECT * FROM ${table}`
  const params: any[] = []

  if (organizationId && table !== 'users' && table !== 'organizations') {
    query += ' WHERE organization_id = ?'
    params.push(organizationId)
  }

  if (startDate && ['sales', 'purchase_orders', 'stock_transfers'].includes(table)) {
    const whereClause = query.includes('WHERE') ? ' AND created_at >= ?' : ' WHERE created_at >= ?'
    query += whereClause
    params.push(startDate)
  }

  if (endDate && ['sales', 'purchase_orders', 'stock_transfers'].includes(table)) {
    const whereClause = query.includes('WHERE') ? ' AND created_at <= ?' : ' WHERE created_at <= ?'
    query += whereClause
    params.push(endDate)
  }

  const rows = db.prepare(query).all(...params)

  if (format === 'json') {
    return new NextResponse(JSON.stringify(rows, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No data to export' }, { status: 404 })
  }

  const headers = Object.keys(rows[0] || {})
  const csv = convertToCSV(rows, headers)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function convertToCSV(data: any[], headers: string[]): string {
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) {
      return ''
    }
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"'
    }
    return str
  }

  const headerRow = headers.map(escapeCSV).join(',')
  const dataRows = data.map(row =>
    headers.map(header => escapeCSV(row[header])).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}
