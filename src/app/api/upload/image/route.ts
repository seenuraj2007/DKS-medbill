import { NextRequest, NextResponse } from 'next/server'
import ImageKit from 'imagekit'
import { v4 as uuidv4 } from 'uuid'
import { getUserFromRequest } from '@/lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''
})

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || !user.tenantId) {
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

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Read file as base64
    const bytes = await file.arrayBuffer()
    const base64String = Buffer.from(bytes).toString('base64')
    const mimeType = file.type

    // Generate unique filename with UUID
    const fileId = uuidv4()
    const orgFolder = user.tenantId.replace(/-/g, '').substring(0, 12)
    const fileName = `${fileId}.webp`
    
    // Upload to ImageKit with organization folder
    const uploadResponse = await imagekit.upload({
      file: base64String,
      fileName: fileName,
      folder: `stockalert/${orgFolder}`,
      isPrivateFile: false,
      useUniqueFileName: false,
      tags: ['product-image', `org:${user.tenantId}`],
      customMetadata: {
        uploadedBy: user.id,
        organizationId: user.tenantId,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    })

    // Get the optimized URL from ImageKit
    const imageUrl = uploadResponse.url

    return NextResponse.json({
      imageUrl,
      fileId: uploadResponse.fileId,
      name: uploadResponse.name,
      size: uploadResponse.size
    }, { status: 201 })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
