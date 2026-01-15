import sharp from 'sharp'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export interface OptimizedImage {
  original: string
  thumbnail: string
  webp: string
}

export async function optimizeImage(
  file: Buffer,
  filename: string
): Promise<OptimizedImage> {
  const baseName = uuidv4()
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }

  const subDir = join(UPLOAD_DIR, 'profiles')
  if (!existsSync(subDir)) {
    await mkdir(subDir, { recursive: true })
  }

  const originalPath = join(subDir, `${baseName}.${ext}`)
  const thumbnailPath = join(subDir, `${baseName}_thumb.${ext}`)
  const webpPath = join(subDir, `${baseName}.webp`)

  await writeFile(originalPath, file)

  await sharp(file)
    .resize(200, 200, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 80 })
    .toFile(thumbnailPath)

  await sharp(file)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(webpPath)

  return {
    original: `/uploads/profiles/${baseName}.${ext}`,
    thumbnail: `/uploads/profiles/${baseName}_thumb.${ext}`,
    webp: `/uploads/profiles/${baseName}.webp`,
  }
}

export async function deleteOptimizedImage(url: string): Promise<void> {
  if (!url) return

  const paths = [
    join(process.cwd(), 'public', url),
    url.replace('.webp', '_thumb.jpg'),
    url.replace(/\.[^.]+$/, '_thumb.jpg'),
  ]

  for (const path of paths) {
    try {
      if (existsSync(path)) {
        await unlink(path)
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }
}

export function isValidImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ]
  return validTypes.includes(mimeType)
}

export function getImageDimensions(file: Buffer): Promise<{ width: number; height: number }> {
  return sharp(file).metadata().then((metadata) => ({
    width: metadata.width || 0,
    height: metadata.height || 0,
  }))
}

export async function processAvatarUpload(
  file: Buffer,
  filename: string
): Promise<UploadResult> {
  try {
    if (!isValidImageType(getMimeType(filename))) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.' }
    }

    const result = await optimizeImage(file, filename)

    return {
      success: true,
      url: result.thumbnail,
    }
  } catch (error) {
    console.error('Image processing error:', error)
    return { success: false, error: 'Failed to process image' }
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

export async function generateAvatarPlaceholder(name: string): Promise<string> {
  const firstChar = name.charAt(0).toUpperCase()
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad)"/>
      <text x="100" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">${firstChar}</text>
    </svg>
  `
  
  const baseName = uuidv4()
  const path = join(UPLOAD_DIR, 'profiles', `${baseName}.svg`)
  
  if (!existsSync(join(UPLOAD_DIR, 'profiles'))) {
    await mkdir(join(UPLOAD_DIR, 'profiles'), { recursive: true })
  }
  
  await writeFile(path, svg)
  
  return `/uploads/profiles/${baseName}.svg`
}
