import { env } from '@/lib/env'
import type { SiteSettings } from '@/types/database'

export type Bucket = 'media' | 'resumes'

/** Public URL of a file in a public Storage bucket (no client library needed). */
export function publicUrl(bucket: Bucket, path: string) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')
  return `${env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodedPath}`
}

/** Public URL that opens the resume PDF in the browser. */
export function resumeViewUrl(settings: Pick<SiteSettings, 'resume_path'>) {
  return settings.resume_path ? publicUrl('resumes', settings.resume_path) : null
}

/** Public URL that downloads the resume with its original file name. */
export function resumeDownloadUrl(settings: Pick<SiteSettings, 'resume_path' | 'resume_file_name'>) {
  if (!settings.resume_path) return null
  const url = new URL(publicUrl('resumes', settings.resume_path))
  url.searchParams.set('download', settings.resume_file_name ?? 'resume.pdf')
  return url.toString()
}
