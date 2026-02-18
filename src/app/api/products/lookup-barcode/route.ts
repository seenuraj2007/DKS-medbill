import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface OpenFoodFactsProduct {
  product_name?: string
  product_name_en?: string
  product_name_fr?: string
  product_name_es?: string
  product_name_de?: string
  product_name_it?: string
  product_name_pt?: string
  brands?: string
  categories?: string
  image_url?: string
  image_front_url?: string
  quantity?: string
  packaging?: string
  labels?: string
  origins?: string
  manufacturing_places?: string
}

interface OpenFoodFactsResponse {
  code: string
  product?: OpenFoodFactsProduct
  status: number
  status_verbose: string
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { barcode } = body

    if (!barcode || barcode.length < 8) {
      return NextResponse.json({ 
        error: 'Invalid barcode',
        found: false 
      }, { status: 400 })
    }

    let productData: any = {
      barcode,
      found: false,
      source: null
    }

    // 1. First check local database (products already entered by this tenant)
    const existingProduct = await prisma.product.findFirst({
      where: {
        tenantId: user.tenantId,
        barcode: barcode
      }
    })

    if (existingProduct) {
      return NextResponse.json({
        barcode,
        found: true,
        source: 'local',
        product: {
          name: existingProduct.name,
          category: existingProduct.category || '',
          unit: existingProduct.unit,
          sellingPrice: existingProduct.sellingPrice ? Number(existingProduct.sellingPrice) : null,
          unitCost: existingProduct.unitCost ? Number(existingProduct.unitCost) : null,
          imageUrl: existingProduct.imageUrl,
          hsnCode: existingProduct.hsnCode,
          gstRate: existingProduct.gstRate ? Number(existingProduct.gstRate) : 0,
          isPerishable: existingProduct.isPerishable,
          weightPerUnit: existingProduct.weightPerUnit ? Number(existingProduct.weightPerUnit) : null,
          minWeight: existingProduct.minWeight ? Number(existingProduct.minWeight) : null
        },
        message: 'Product already exists in your inventory'
      })
    }

    // 2. Try Open Food Facts API (free, for food/grocery items)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)

      if (response.ok) {
        const data: OpenFoodFactsResponse = await response.json()
        
        if (data.status === 1 && data.product) {
          const product = data.product
          
          let weightPerUnit = 1
          let unit = 'unit'
          
          if (product.quantity) {
            const weightMatch = product.quantity.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l)/i)
            if (weightMatch) {
              const value = parseFloat(weightMatch[1])
              const unit = weightMatch[2].toLowerCase()
              
              if (unit === 'g') {
                weightPerUnit = value / 1000
              } else if (unit === 'kg') {
                weightPerUnit = value
              } else if (unit === 'ml') {
                weightPerUnit = value / 1000
              } else if (unit === 'l') {
                weightPerUnit = value
              }
            }
          }

          const isLiquid = product.categories?.toLowerCase().includes('beverage') ||
                          product.categories?.toLowerCase().includes('drink') ||
                          product.quantity?.toLowerCase().includes('ml') ||
                          product.quantity?.toLowerCase().includes('l')

          const productName = product.product_name || 
                             product.product_name_en || 
                             product.product_name_fr || 
                             product.product_name_es || 
                             product.product_name_de || 
                             product.product_name_it || 
                             product.product_name_pt || ''

          productData = {
            barcode,
            found: true,
            source: 'openfoodfacts',
            product: {
              name: productName,
              category: product.categories?.split(',')[0]?.trim() || 'Groceries',
              brand: product.brands?.split(',')[0]?.trim() || '',
              unit: isLiquid ? 'liter' : 'kg',
              weightPerUnit: weightPerUnit,
              minWeight: isLiquid ? 0.1 : 0.05,
              imageUrl: product.image_url || product.image_front_url || '',
              isPerishable: product.labels?.toLowerCase().includes('fresh') || 
                           product.labels?.toLowerCase().includes('refrigerated') ||
                           product.categories?.toLowerCase().includes('dairy') ||
                           product.categories?.toLowerCase().includes('meat') ||
                           false,
              gstRate: 18,
              hsnCode: '',
              sellingPrice: null,
              unitCost: null
            }
          }

          return NextResponse.json(productData)
        }
      }
    } catch (error) {
      console.log('Open Food Facts lookup failed:', error)
    }

    // 3. Try Outpan API (free, for general products)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(
        `https://api.outpan.com/v2/products/${barcode}`,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        }
      )
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        
        if (data && data.name) {
          productData = {
            barcode,
            found: true,
            source: 'outpan',
            product: {
              name: data.name,
              category: data.category || 'General',
              brand: data.brand || '',
              unit: 'unit',
              weightPerUnit: 1,
              minWeight: 1,
              imageUrl: data.images?.[0] || '',
              isPerishable: false,
              gstRate: 18,
              hsnCode: '',
              sellingPrice: null,
              unitCost: null
            }
          }

          return NextResponse.json(productData)
        }
      }
    } catch (error) {
      console.log('Outpan lookup failed:', error)
    }

    // 4. Try UPC Database (free, no API key required for basic lookups)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
        { signal: controller.signal }
      )
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        
        if (data.items && data.items.length > 0) {
          const item = data.items[0]
          productData = {
            barcode,
            found: true,
            source: 'upcitemdb',
            product: {
              name: item.title,
              category: item.category || 'General',
              brand: item.brand || '',
              unit: 'unit',
              weightPerUnit: 1,
              minWeight: 1,
              imageUrl: item.images?.[0] || '',
              isPerishable: false,
              gstRate: 18,
              hsnCode: '',
              sellingPrice: null,
              unitCost: null
            }
          }

          return NextResponse.json(productData)
        }
      }
    } catch (error) {
      console.log('UPC Database lookup failed:', error)
    }

    // 5. Not found anywhere
    return NextResponse.json({
      barcode,
      found: false,
      source: null,
      message: 'Product not found. Please enter details manually.'
    })

  } catch (error) {
    console.error('Barcode lookup error:', error)
    return NextResponse.json({ 
      error: 'Failed to lookup barcode',
      found: false 
    }, { status: 500 })
  }
}
