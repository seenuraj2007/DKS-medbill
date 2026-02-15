import { NextRequest, NextResponse } from 'next/server'
import ImageKit from 'imagekit'
import { v4 as uuidv4 } from 'uuid'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Read file as base64
    const bytes = await file.arrayBuffer()
    const base64String = Buffer.from(bytes).toString('base64')

    // Generate unique filename
    const fileId = uuidv4()
    const fileName = `${fileId}.webp`

    // Upload to ImageKit with user folder
    const uploadResponse = await imagekit.upload({
      file: base64String,
      fileName: fileName,
      folder: `stockalert/profiles/${user.id}`,
      isPrivateFile: false,
      useUniqueFileName: false,
      tags: ['profile-image', `user:${user.id}`, `org:${user.tenantId}`],
      customMetadata: {
        uploadedBy: user.id,
        organizationId: user.tenantId,
        uploadedAt: new Date().toISOString()
      }
    })

    const imageUrl = uploadResponse.url

    // Update user profile image in database
    await prisma.user.update({
      where: { id: user.id },
      data: { metadata: { profileImage: imageUrl } }
    })

    return NextResponse.json({
      success: true,
      url: imageUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete profile image from database
    await prisma.user.update({
      where: { id: user.id },
      data: { metadata: undefined }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
