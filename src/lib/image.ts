const DEFAULT_MAX_DIMENSION = 1600
const DEFAULT_QUALITY = 0.82

/**
 * Resizes an image in the browser and re-encodes it as WebP (falls back to the
 * original file when the browser can't encode WebP or the result is larger).
 */
export async function compressImage(
  file: File,
  { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    return file
  }
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', quality),
  )

  if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
  return blob
}

export function extensionForType(type: string) {
  switch (type) {
    case 'image/webp':
      return 'webp'
    case 'image/png':
      return 'png'
    case 'image/avif':
      return 'avif'
    case 'application/pdf':
      return 'pdf'
    default:
      return 'jpg'
  }
}
