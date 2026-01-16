import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserFromRequest } from '@/lib/auth'
import { processAvatarUpload, deleteOptimizedImage } from '@/lib/image-optimizer'

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

    const { data: oldUser } = await supabase
      .from('users')
      .select('profile_image')
      .eq('id', user.id)
      .single()

    if (oldUser?.profile_image) {
      await deleteOptimizedImage(oldUser.profile_image)
    }

    const { error } = await supabase
      .from('users')
      .update({ profile_image: result.url })
      .eq('id', user.id)

    if (error) {
      console.error('Update profile image error:', error)
      return NextResponse.json({ error: 'Failed to update profile image' }, { status: 500 })
    }

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

    const { data: oldUser } = await supabase
      .from('users')
      .select('profile_image')
      .eq('id', user.id)
      .single()

    if (oldUser?.profile_image) {
      await deleteOptimizedImage(oldUser.profile_image)
    }

    const { error } = await supabase
      .from('users')
      .update({ profile_image: null })
      .eq('id', user.id)

    if (error) {
      console.error('Delete profile image error:', error)
      return NextResponse.json({ error: 'Failed to delete profile image' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
