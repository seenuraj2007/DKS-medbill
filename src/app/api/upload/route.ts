import { NextRequest, NextResponse } from 'next/server'
import ImageKit from 'imagekit'
import { v4 as uuidv4 } from 'uuid'
import { getUserFromRequest } from '@/lib/auth'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

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
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: jpg, jpeg, png, gif, webp' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Read file as base64
    const bytes = await file.arrayBuffer()
    const base64String = Buffer.from(bytes).toString('base64')

    // Generate unique filename
    const fileId = uuidv4()
    const fileName = `${fileId}.webp`

    // Upload to ImageKit with organization folder
    const uploadResponse = await imagekit.upload({
      file: base64String,
      fileName: fileName,
      folder: `stockalert/${user.tenantId.replace(/-/g, '').substring(0, 12)}`,
      isPrivateFile: false,
      useUniqueFileName: false,
      tags: ['upload', `org:${user.tenantId}`],
      customMetadata: {
        uploadedBy: user.id,
        organizationId: user.tenantId,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    })

    const imageUrl = uploadResponse.url

    return NextResponse.json({ image_url: imageUrl }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
