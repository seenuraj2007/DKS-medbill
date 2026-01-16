import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const exportFormat = searchParams.get('format') || 'json'
    const table = searchParams.get('table') || 'products'

    if (!['json', 'csv'].includes(exportFormat)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    const validTables = ['products', 'locations', 'suppliers', 'customers', 
                        'purchase_orders', 'stock_transfers', 'stock_history', 'alerts']
    if (!validTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `stockalert-${table}-${timestamp}.${exportFormat}`

    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Export error:', error)
      return NextResponse.json({ error: 'Export failed' }, { status: 500 })
    }

    if (exportFormat === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 404 })
    }

    const headers = Object.keys(data[0])
    const csv = convertToCSV(data, headers)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

function convertToCSV(data: Array<Record<string, unknown>>, headers: string[]): string {
  const escapeCSV = (value: unknown): string => {
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
