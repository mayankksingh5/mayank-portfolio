import { supabase } from '@/lib/supabase'
import { deleteFiles, uploadFile } from '@/services/storage'
import type { Profile, SiteSettings } from '@/types/database'

export { resumeDownloadUrl } from '@/lib/storageUrl'

type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
type SettingsUpdate = Partial<Omit<SiteSettings, 'id' | 'created_at' | 'updated_at'>>

export async function fetchProfile() {
  const { data, error } = await supabase.from('profile').select('*').eq('id', 1).single()
  if (error) throw error
  return data
}

export async function updateProfile(values: ProfileUpdate) {
  const { error } = await supabase.from('profile').update(values).eq('id', 1)
  if (error) throw error
}

export async function fetchSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single()
  if (error) throw error
  return data
}

export async function updateSiteSettings(values: SettingsUpdate) {
  const { error } = await supabase.from('site_settings').update(values).eq('id', 1)
  if (error) throw error
}

/**
 * Uploads a new resume under a unique path, points site_settings at it, then
 * deletes the previous file. Visitors always get the latest file because the
 * URL changes with every upload.
 */
export async function replaceResume(
  file: File,
  previousPath: string | null,
  onProgress?: (percent: number) => void,
) {
  const path = `resume-${Date.now()}.pdf`
  await uploadFile('resumes', path, file, onProgress)

  try {
    await updateSiteSettings({
      resume_path: path,
      resume_file_name: file.name,
      resume_updated_at: new Date().toISOString(),
    })
  } catch (error) {
    await deleteFiles('resumes', [path])
    throw error
  }

  await deleteFiles('resumes', [previousPath])
}

export async function removeResume(previousPath: string | null) {
  await updateSiteSettings({ resume_path: null, resume_file_name: null, resume_updated_at: null })
  await deleteFiles('resumes', [previousPath])
}
