import { env } from '@/lib/env'
import { compressImage, extensionForType } from '@/lib/image'
import { publicUrl, type Bucket } from '@/lib/storageUrl'
import { supabase } from '@/lib/supabase'

export { publicUrl, type Bucket }

export const MAX_IMAGE_INPUT_BYTES = 15 * 1024 * 1024
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024
export const MAX_RESUME_BYTES = 10 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

function parseStorageError(responseText: string) {
  try {
    const body = JSON.parse(responseText) as { message?: string; error?: string }
    return body.message ?? body.error ?? 'Upload failed.'
  } catch {
    return 'Upload failed.'
  }
}

/**
 * Uploads through the Storage REST endpoint with XMLHttpRequest so the admin
 * UI can show real upload progress (supabase-js upload has no progress events).
 */
export async function uploadFile(
  bucket: Bucket,
  path: string,
  file: Blob,
  onProgress?: (percent: number) => void,
) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Your session has expired. Please sign in again.')

  const encodedPath = path.split('/').map(encodeURIComponent).join('/')

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${encodedPath}`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', env.VITE_SUPABASE_ANON_KEY)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    // Every upload gets a unique path, so files can be cached for a year.
    xhr.setRequestHeader('cache-control', 'max-age=31536000')
    xhr.setRequestHeader('x-upsert', 'false')

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(parseStorageError(xhr.responseText)))
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'))
    xhr.send(file)
  })

  return path
}

/** Compresses an image and uploads it to the media bucket under `folder/`. */
export async function uploadImage(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void,
) {
  const blob = await compressImage(file)
  if (blob.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error('Image is still larger than 5 MB after compression. Choose a smaller image.')
  }
  const path = `${folder}/${crypto.randomUUID()}.${extensionForType(blob.type)}`
  return uploadFile('media', path, blob, onProgress)
}

/** Best-effort cleanup; a leftover file is harmless, so errors are only logged. */
export async function deleteFiles(bucket: Bucket, paths: (string | null | undefined)[]) {
  const toDelete = paths.filter((path): path is string => Boolean(path))
  if (toDelete.length === 0) return
  const { error } = await supabase.storage.from(bucket).remove(toDelete)
  if (error) console.warn('Could not delete old files', error)
}
