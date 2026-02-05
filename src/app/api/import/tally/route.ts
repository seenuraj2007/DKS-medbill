import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getCurrentTenantId } from '@/lib/auth'
import { tallyImporter, TallyProduct } from '@/lib/tally-importer'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request as any)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getCurrentTenantId(request as any)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const locationId = formData.get('locationId') as string
    const dryRun = formData.get('dryRun') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Check file type
    const fileType = file.name.toLowerCase()
    const isXML = fileType.endsWith('.xml')
    const isCSV = fileType.endsWith('.csv')

    if (!isXML && !isCSV) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload .xml or .csv file' },
        { status: 400 }
      )
    }

    // Read file content
    const fileContent = await file.text()

    // Parse based on file type
    let importResult
    if (isXML) {
      importResult = tallyImporter.parseTallyXML(fileContent)
    } else {
      importResult = tallyImporter.parseTallyCSV(fileContent)
    }

    if (!importResult.success || importResult.products.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid products found in file',
          details: importResult.errors,
          totalCount: importResult.totalCount,
        },
        { status: 400 }
      )
    }

    // Validate products
    const { valid: validatedProducts, errors: validationErrors } = tallyImporter.validateProducts(
      importResult.products
    )

    if (validatedProducts.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid products after validation',
          validationErrors,
          parseErrors: importResult.errors,
        },
        { status: 400 }
      )
    }

    // If dry run, return preview without saving
    if (dryRun) {
      return NextResponse.json({
        success: true,
        preview: true,
        products: validatedProducts.slice(0, 10), // Show first 10
        totalProducts: validatedProducts.length,
        parseErrors: importResult.errors,
        validationErrors,
      })
    }

    // Import products to database
    const importedProducts = []
    const importErrors: string[] = []

    for (const tallyProduct of validatedProducts) {
      try {
        // Check if product already exists
        const existingProduct = await prisma.product.findFirst({
          where: {
            tenantId,
            OR: [
              { sku: tallyProduct.sku },
              { name: { equals: tallyProduct.name, mode: 'insensitive' } },
            ],
          },
        })

        if (existingProduct) {
          // Update existing product
          const updated = await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: tallyProduct.name,
              description: tallyProduct.description,
              unitCost: tallyProduct.unitCost,
              sellingPrice: tallyProduct.sellingPrice,
              unit: tallyProduct.unit,
            },
          })
          importedProducts.push({ ...updated, action: 'updated' })
        } else {
          // Create new product
          const created = await prisma.product.create({
            data: {
              tenantId,
              name: tallyProduct.name,
              sku: tallyProduct.sku,
              description: tallyProduct.description,
              unitCost: tallyProduct.unitCost,
              sellingPrice: tallyProduct.sellingPrice,
              unit: tallyProduct.unit,
              category: tallyProduct.category,
            },
          })
          importedProducts.push({ ...created, action: 'created' })

          // Create initial stock entry if location provided
          if (locationId && tallyProduct.openingStock > 0) {
            await prisma.stockLevel.create({
              data: {
                tenantId,
                productId: created.id,
                locationId: locationId,
                quantity: tallyProduct.openingStock,
              },
            })

            // Create inventory event
            await prisma.inventoryEvent.create({
              data: {
                tenantId,
                productId: created.id,
                locationId: locationId,
                type: 'STOCK_RECEIVED',
                quantityDelta: tallyProduct.openingStock,
                runningBalance: tallyProduct.openingStock,
                userId: user.id,
                notes: 'Imported from Tally - Opening Stock',
              },
            })
          }
        }
      } catch (error) {
        logger.error('Failed to import product', { error, product: tallyProduct.name })
        importErrors.push(`Failed to import ${tallyProduct.name}: ${error}`)
      }
    }

    logger.info('Tally import completed', {
      tenantId,
      totalImported: importedProducts.length,
      errors: importErrors.length,
    })

    return NextResponse.json({
      success: true,
      imported: importedProducts.length,
      created: importedProducts.filter((p: Record<string, unknown>) => p.action === 'created').length,
      updated: importedProducts.filter((p: Record<string, unknown>) => p.action === 'updated').length,
      products: importedProducts.slice(0, 20), // Return first 20
      parseErrors: importResult.errors,
      validationErrors,
      importErrors: importErrors.slice(0, 10), // Return first 10 errors
    })

  } catch (error) {
    logger.error('Tally import API error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request as any)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tenantId = await getCurrentTenantId(request as any)
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization locations for the import dropdown
    const locations = await prisma.location.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    })

    return NextResponse.json({
      locations,
      instructions: {
        xml: 'Export from Tally: Gateway > Display > List of Accounts > Stock Items > Export > XML Format',
        csv: 'Export from Tally: Gateway > Display > List of Accounts > Stock Items > Export > CSV Format',
      },
    })
  } catch (error) {
    logger.error('Tally import info error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
