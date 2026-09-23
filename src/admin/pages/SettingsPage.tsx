import { z } from 'zod'
import { LoadError } from '@/admin/components/LoadError'
import { PageHeader } from '@/admin/components/PageHeader'
import { SectionSpinner } from '@/admin/components/Spinner'
import { SingletonForm } from '@/admin/forms/SingletonForm'
import type { FieldConfig } from '@/admin/forms/types'
import { imagePath, requiredText } from '@/admin/forms/validation'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchSiteSettings, updateSiteSettings } from '@/services/siteContent'

const fields: FieldConfig[] = [
  {
    name: 'site_title',
    label: 'Site title',
    type: 'text',
    required: true,
    hint: 'Shown in the browser tab and search results.',
  },
  {
    name: 'meta_description',
    label: 'Search description',
    type: 'textarea',
    rows: 3,
    hint: 'One or two sentences for Google and link previews. About 150 characters works best.',
  },
  {
    name: 'og_image_path',
    label: 'Share image',
    type: 'image',
    folder: 'og',
    hint: 'Shown when your portfolio link is shared on LinkedIn, WhatsApp, etc. 1200 × 630 works best.',
  },
]

const schema = z.object({
  site_title: requiredText('Site title').max(70, 'Keep the title under 70 characters'),
  meta_description: z.string().trim().max(300, 'Keep the description under 300 characters'),
  og_image_path: imagePath,
})

export default function SettingsPage() {
  const settings = useAsyncData(fetchSiteSettings)

  return (
    <>
      <PageHeader title="Settings" description="Site title, search description and share image." />
      {settings.status === 'loading' && <SectionSpinner />}
      {settings.status === 'error' && <LoadError message={settings.error} onRetry={settings.reload} />}
      {settings.status === 'success' && (
        <SingletonForm
          fields={fields}
          schema={schema}
          initialValues={{
            site_title: settings.data.site_title,
            meta_description: settings.data.meta_description,
            og_image_path: settings.data.og_image_path,
          }}
          onSave={(payload) => updateSiteSettings(payload)}
        />
      )}
    </>
  )
}
