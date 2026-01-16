import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getUserFromRequest } from '@/lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_DIMENSION = 5000

async function validateImageBuffer(buffer: Buffer): Promise<{ valid: boolean; error?: string; metadata?: any }> {
  try {
    const metadata = await sharp(buffer).metadata()

    if (!metadata.width || !metadata.height || !metadata.format) {
      return { valid: false, error: 'Invalid image file' }
    }

    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      return { valid: false, error: `Image dimensions too large. Maximum: ${MAX_DIMENSION}x${MAX_DIMENSION}px` }
    }

    const mimeTypes: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif'
    }

    const mimeType = mimeTypes[metadata.format as string]
    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return { valid: false, error: `Invalid file type. Detected: ${mimeType || 'unknown'}` }
    }

    return { valid: true, metadata }
  } catch (error) {
    return { valid: false, error: 'Invalid image file' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(bytes)) as Buffer

    const validation = await validateImageBuffer(buffer)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products')
    await mkdir(uploadDir, { recursive: true })

    const filename = `${uuidv4()}.webp`
    const filepath = path.join(uploadDir, filename)

    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer()

    await writeFile(filepath, optimizedBuffer)

    const imageUrl = `/uploads/products/${filename}`

    return NextResponse.json({
      imageUrl,
      filename,
      size: optimizedBuffer.length
    }, { status: 201 })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
