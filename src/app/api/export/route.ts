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
    const table = searchParams.get('table')
    const scope = searchParams.get('scope') || 'all'

    if (!['json', 'csv'].includes(exportFormat)) {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `stockalert-export-${timestamp}`

    if (scope === 'all' && !table) {
      const exportData: Record<string, any[]> = {}

      const tables = [
        'products',
        'locations',
        'suppliers',
        'purchase_orders',
        'stock_transfers',
        'alerts',
        'stock_history'
      ]

      for (const t of tables) {
        const { data, error } = await supabase
          .from(t)
          .select('*')
          .eq('user_id', user.id)

        if (!error && data) {
          exportData[t] = data
        }
      }

      exportData.user_profile = [{
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        organization_id: user.organization_id,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at
      }]

      const json = JSON.stringify(exportData, null, 2)

      return new NextResponse(json, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      })
    }

    const validTables = ['products', 'locations', 'suppliers', 'customers', 
                        'purchase_orders', 'stock_transfers', 'stock_history', 'alerts']
    const exportTable = table || 'products'
    if (!validTables.includes(exportTable)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(exportTable)
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Export error:', error)
      return NextResponse.json({ error: 'Export failed' }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 404 })
    }

    if (exportFormat === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}-${exportTable}.json"`,
        },
      })
    }

    const headers = Object.keys(data[0])
    const csv = convertToCSV(data, headers)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}-${exportTable}.csv"`,
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
