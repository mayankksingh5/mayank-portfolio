import { z } from 'zod'
import { LoadError } from '@/admin/components/LoadError'
import { PageHeader } from '@/admin/components/PageHeader'
import { SectionSpinner } from '@/admin/components/Spinner'
import { SingletonForm } from '@/admin/forms/SingletonForm'
import type { FieldConfig } from '@/admin/forms/types'
import { imagePath, optionalEmail, requiredText } from '@/admin/forms/validation'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchProfile, updateProfile } from '@/services/siteContent'

const fields: FieldConfig[] = [
  { name: 'full_name', label: 'Full name', type: 'text', required: true, half: true },
  { name: 'location', label: 'Location', type: 'text', half: true, placeholder: 'e.g. Delhi, India' },
  {
    name: 'headline',
    label: 'Headline',
    type: 'text',
    placeholder: 'e.g. Full-Stack Developer | React & Node.js',
    hint: 'Shown under your name at the top of the portfolio.',
  },
  {
    name: 'contact_email',
    label: 'Contact email',
    type: 'email',
    hint: 'Shown in the contact section.',
  },
  {
    name: 'about',
    label: 'About',
    type: 'textarea',
    rows: 8,
    hint: 'A few short paragraphs about you. Leave a blank line between paragraphs.',
  },
  { name: 'avatar_path', label: 'Profile photo', type: 'image', folder: 'profile', aspect: 'square' },
]

const schema = z.object({
  full_name: requiredText('Full name'),
  location: z.string().trim().max(200, 'Location is too long'),
  headline: z.string().trim().max(200, 'Headline is too long'),
  contact_email: optionalEmail,
  about: z.string().trim().max(5000, 'About is too long'),
  avatar_path: imagePath,
})

export default function ProfilePage() {
  const profile = useAsyncData(fetchProfile)

  return (
    <>
      <PageHeader title="Profile" description="Your name, headline, about section and photo." />
      {profile.status === 'loading' && <SectionSpinner />}
      {profile.status === 'error' && <LoadError message={profile.error} onRetry={profile.reload} />}
      {profile.status === 'success' && (
        <SingletonForm
          fields={fields}
          schema={schema}
          initialValues={{
            full_name: profile.data.full_name,
            location: profile.data.location,
            headline: profile.data.headline,
            contact_email: profile.data.contact_email ?? '',
            about: profile.data.about,
            avatar_path: profile.data.avatar_path,
          }}
          onSave={(payload) => updateProfile(payload)}
        />
      )}
    </>
  )
}
