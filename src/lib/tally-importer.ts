import { logger } from './logger'
import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
})

export interface TallyProduct {
  name: string
  sku: string
  description?: string
  category?: string
  unitCost: number
  sellingPrice: number
  gstRate: number
  hsnCode?: string
  openingStock: number
  reorderPoint: number
  unit?: string
}

export interface TallyImportResult {
  success: boolean
  products: TallyProduct[]
  errors: string[]
  totalCount: number
  importedCount: number
}

export class TallyImporter {
  /**
   * Parse Tally XML export file
   */
  parseTallyXML(xmlContent: string): TallyImportResult {
    const result: TallyImportResult = {
      success: false,
      products: [],
      errors: [],
      totalCount: 0,
      importedCount: 0,
    }

    try {
      const parsedData = parser.parse(xmlContent)
      
      // Handle different Tally XML structures
      let stockItems: any[] = []
      
      if (parsedData.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA) {
        const request = parsedData.ENVELOPE.BODY.IMPORTDATA.REQUESTDATA
        if (Array.isArray(request)) {
          request.forEach(item => {
            if (item.STOCKITEM) stockItems.push(...(Array.isArray(item.STOCKITEM) ? item.STOCKITEM : [item.STOCKITEM]))
          })
        } else if (request.STOCKITEM) {
          stockItems = Array.isArray(request.STOCKITEM) ? request.STOCKITEM : [request.STOCKITEM]
        }
      } else if (parsedData.STOCKITEM) {
        stockItems = Array.isArray(parsedData.STOCKITEM) ? parsedData.STOCKITEM : [parsedData.STOCKITEM]
      }

      result.totalCount = stockItems.length

      stockItems.forEach((item, index) => {
        try {
          const product = this.extractProductFromStockItem(item)
          if (product) {
            result.products.push(product)
            result.importedCount++
          }
        } catch (error) {
          result.errors.push(`Error parsing item ${index + 1}: ${error}`)
        }
      })

      result.success = result.importedCount > 0
      logger.info('Tally XML parsed', { 
        total: result.totalCount, 
        imported: result.importedCount,
        errors: result.errors.length 
      })

    } catch (error) {
      logger.error('Failed to parse Tally XML', { error })
      result.errors.push('Failed to parse XML file')
    }

    return result
  }

  /**
   * Parse Tally Excel export (CSV format)
   */
  parseTallyCSV(csvContent: string): TallyImportResult {
    const result: TallyImportResult = {
      success: false,
      products: [],
      errors: [],
      totalCount: 0,
      importedCount: 0,
    }

    try {
      const lines = csvContent.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        result.errors.push('CSV file is empty or has no data')
        return result
      }

      // Parse headers
      const headers = this.parseCSVLine(lines[0])
      
      // Map common Tally CSV column names
      const columnMap = this.detectColumnMappings(headers)

      logger.info('CSV column mapping detected', {
        headers: headers.slice(0, 20),
        columnMap
      })

      if (!columnMap.name) {
        result.errors.push('Could not detect product name column')
        return result
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i])
          if (values.length < 2) continue

          const product = this.extractProductFromCSVRow(values, columnMap)
          if (product) {
            result.products.push(product)
            result.importedCount++
          }
        } catch (error) {
          result.errors.push(`Error parsing row ${i}: ${error}`)
        }
      }

      result.totalCount = lines.length - 1
      result.success = result.importedCount > 0

      logger.info('Tally CSV parsed', { 
        total: result.totalCount, 
        imported: result.importedCount,
        errors: result.errors.length 
      })

    } catch (error) {
      logger.error('Failed to parse Tally CSV', { error })
      result.errors.push('Failed to parse CSV file')
    }

    return result
  }

  private extractProductFromStockItem(item: any): TallyProduct | null {
    const name = item.NAME || item['@_NAME']
    if (!name) return null

    // Extract SKU (alias in Tally)
    const sku = item.ALIAS || item['@_ALIAS'] || this.generateSKU(name)

    // Extract GST details
    const gstRate = parseFloat(item.GSTRATEDUTYHEAD?.valueOf?.() || item['@_GSTRATEDUTYHEAD'] || '0') || 0
    const hsnCode = item.HSNCODE || item['@_HSNCODE'] || ''

    // Extract opening balance/stock - check multiple possible formats
    const openingBalance = item.OPENINGBALANCE || item.OPENING || item.OPENINGSTOCK || item.BOPENING
    let openingStock = 0
    let unit = 'PCS'
    
    if (openingBalance && typeof openingBalance === 'object') {
      const amount = openingBalance.AMOUNT || openingBalance['@_AMOUNT']
      const quantity = openingBalance.QUANTITY || openingBalance['@_QUANTITY'] || openingBalance.qty || openingBalance.Qty
      if (quantity) {
        openingStock = parseFloat(String(quantity)) || 0
      }
      const unitElement = openingBalance.UNIT || openingBalance['@_UNIT']
      if (unitElement) {
        unit = String(unitElement) || 'PCS'
      }
    } else if (typeof openingBalance === 'number') {
      openingStock = openingBalance
    } else if (typeof openingBalance === 'string') {
      // Parse string like "10 Nos" or "5.5 Kgs"
      const match = openingBalance.match(/^([\d.]+)\s*(\w+)?/)
      if (match) {
        openingStock = parseFloat(match[1]) || 0
        if (match[2]) unit = match[2]
      }
    }

    // Also check for CLOSINGBALANCE as fallback
    const closingBalance = item.CLOSINGBALANCE || item.CLOSING || item.BCLOSING
    if (openingStock === 0 && closingBalance) {
      if (typeof closingBalance === 'object') {
        const qty = closingBalance.QUANTITY || closingBalance['@_QUANTITY'] || closingBalance.qty
        if (qty) {
          openingStock = parseFloat(String(qty)) || 0
        }
      } else if (typeof closingBalance === 'number') {
        openingStock = closingBalance
      } else if (typeof closingBalance === 'string') {
        const match = String(closingBalance).match(/^([\d.]+)/)
        if (match) {
          openingStock = parseFloat(match[1]) || 0
        }
      }
    }

    // Extract costs
    const baseUnits = item.BASEUNITS
    let unitCost = 0
    let sellingPrice = 0

    if (baseUnits && typeof baseUnits === 'object') {
      const rate = baseUnits.RATE || baseUnits['@_RATE']
      if (rate) {
        unitCost = parseFloat(rate) || 0
        // Assume selling price is 20% markup if not specified
        sellingPrice = unitCost * 1.2
      }
    }

    // Extract category/group
    const category = item.PARENT || item['@_PARENT'] || item.GROUP || item['@_GROUP'] || ''
    const description = item.DESCRIPTION || item['@_DESCRIPTION'] || ''

    return {
      name,
      sku,
      description,
      category,
      unitCost,
      sellingPrice,
      gstRate,
      hsnCode,
      openingStock,
      reorderPoint: Math.ceil(openingStock * 0.2), // 20% of opening stock
      unit,
    }
  }

  private extractProductFromCSVRow(values: string[], columnMap: Record<string, number | undefined>): TallyProduct | null {
    const name = values[columnMap.name as number]?.trim()
    if (!name) return null

    const unitCost = columnMap.unitCost !== undefined 
      ? parseFloat(values[columnMap.unitCost]) || 0
      : 0
    
    const sellingPrice = columnMap.sellingPrice !== undefined
      ? parseFloat(values[columnMap.sellingPrice]) || unitCost * 1.2
      : unitCost * 1.2

    const openingStock = columnMap.openingStock !== undefined
      ? parseFloat(values[columnMap.openingStock]) || 0
      : 0

    return {
      name,
      sku: columnMap.sku !== undefined ? values[columnMap.sku]?.trim() : this.generateSKU(name),
      description: columnMap.description !== undefined ? values[columnMap.description]?.trim() : undefined,
      category: columnMap.category !== undefined ? values[columnMap.category]?.trim() : undefined,
      unitCost,
      sellingPrice,
      gstRate: columnMap.gstRate !== undefined ? parseFloat(values[columnMap.gstRate]) || 0 : 0,
      hsnCode: columnMap.hsnCode !== undefined ? values[columnMap.hsnCode]?.trim() : undefined,
      openingStock,
      reorderPoint: Math.ceil(openingStock * 0.2),
      unit: columnMap.unit !== undefined ? values[columnMap.unit]?.trim() : 'PCS',
    }
  }

  private detectColumnMappings(headers: string[]): Record<string, number | undefined> {
    const map: Record<string, number | undefined> = {}
    const lowerHeaders = headers.map(h => h.toLowerCase().trim())

    // Name mappings
    const namePatterns = ['name', 'product name', 'item name', 'stock item', 'product']
    map.name = this.findColumnIndex(lowerHeaders, namePatterns)

    // SKU mappings
    const skuPatterns = ['sku', 'alias', 'code', 'item code', 'product code']
    map.sku = this.findColumnIndex(lowerHeaders, skuPatterns)

    // Cost mappings
    const costPatterns = ['cost', 'unit cost', 'purchase price', 'buying price', 'rate']
    map.unitCost = this.findColumnIndex(lowerHeaders, costPatterns)

    // Price mappings
    const pricePatterns = ['price', 'selling price', 'sale price', 'mrp', 'rate']
    map.sellingPrice = this.findColumnIndex(lowerHeaders, pricePatterns)

    // Stock mappings - try multiple patterns
    const stockPatterns = ['opening stock', 'opening', 'stock', 'quantity', 'balance', 'qty', 'closing', 'closing balance', 'closingstock']
    map.openingStock = this.findColumnIndex(lowerHeaders, stockPatterns)

    // Category mappings
    const categoryPatterns = ['category', 'group', 'parent', 'type', 'under']
    map.category = this.findColumnIndex(lowerHeaders, categoryPatterns)

    // GST mappings
    const gstPatterns = ['gst', 'tax', 'gst rate', 'tax rate', 'gstrateduty']
    map.gstRate = this.findColumnIndex(lowerHeaders, gstPatterns)

    // HSN mappings
    const hsnPatterns = ['hsn', 'hsn code', 'sac']
    map.hsnCode = this.findColumnIndex(lowerHeaders, hsnPatterns)

    // Unit mappings
    const unitPatterns = ['unit', 'uom', 'unit of measure', 'base unit']
    map.unit = this.findColumnIndex(lowerHeaders, unitPatterns)

    return map
  }

  private findColumnIndex(headers: string[], patterns: string[]): number | undefined {
    for (const pattern of patterns) {
      const index = headers.findIndex(h => h.includes(pattern))
      if (index !== -1) return index
    }
    return undefined
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  private generateSKU(name: string): string {
    // Generate SKU from first 3 letters of each word + random number
    const words = name.split(' ').filter(w => w.length > 2)
    const prefix = words.slice(0, 3).map(w => w.substring(0, 3).toUpperCase()).join('')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${prefix}-${random}`
  }

  /**
   * Validate imported products
   */
  validateProducts(products: TallyProduct[]): { valid: TallyProduct[]; errors: string[] } {
    const valid: TallyProduct[] = []
    const errors: string[] = []

    products.forEach((product, index) => {
      const rowErrors: string[] = []

      if (!product.name || product.name.length < 2) {
        rowErrors.push(`Row ${index + 1}: Product name is required`)
      }

      if (product.unitCost < 0) {
        rowErrors.push(`Row ${index + 1}: Unit cost cannot be negative`)
      }

      if (product.sellingPrice < 0) {
        rowErrors.push(`Row ${index + 1}: Selling price cannot be negative`)
      }

      if (product.openingStock < 0) {
        rowErrors.push(`Row ${index + 1}: Opening stock cannot be negative`)
      }

      if (rowErrors.length === 0) {
        valid.push(product)
      } else {
        errors.push(...rowErrors)
      }
    })

    return { valid, errors }
  }
}

export const tallyImporter = new TallyImporter()
