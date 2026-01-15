import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { processAvatarUpload, deleteOptimizedImage } from '@/lib/image-optimizer'
import db from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await processAvatarUpload(buffer, file.name)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const oldImageUrl = db.prepare('SELECT profile_image FROM users WHERE id = ?').get(user.id) as { profile_image: string | null } | undefined

    if (oldImageUrl?.profile_image) {
      await deleteOptimizedImage(oldImageUrl.profile_image)
    }

    db.prepare('UPDATE users SET profile_image = ? WHERE id = ?').run(result.url, user.id)

    return NextResponse.json({
      success: true,
      url: result.url,
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

    const oldImageUrl = db.prepare('SELECT profile_image FROM users WHERE id = ?').get(user.id) as { profile_image: string | null } | undefined

    if (oldImageUrl?.profile_image) {
      await deleteOptimizedImage(oldImageUrl.profile_image)
    }

    db.prepare('UPDATE users SET profile_image = NULL WHERE id = ?').run(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
