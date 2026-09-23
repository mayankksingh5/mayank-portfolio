import { z } from 'zod'
import { LoadError } from '@/admin/components/LoadError'
import { PageHeader } from '@/admin/components/PageHeader'
import { SectionSpinner } from '@/admin/components/Spinner'
import { SingletonForm } from '@/admin/forms/SingletonForm'
import type { FieldConfig } from '@/admin/forms/types'
import { imagePath, optionalEmail, optionalText, requiredText, tagList } from '@/admin/forms/validation'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchProfile, updateProfile } from '@/services/siteContent'

const fields: FieldConfig[] = [
  { name: 'full_name', label: 'Full name', type: 'text', required: true, half: true },
  { name: 'location', label: 'Location', type: 'text', half: true, placeholder: 'e.g. Delhi, India' },
  {
    name: 'headline',
    label: 'Headline',
    type: 'text',
    placeholder: 'e.g. DevOps Engineer | Software Developer',
    hint: 'Separate roles with | and they will rotate under your name.',
  },
  {
    name: 'summary',
    label: 'Short intro',
    type: 'textarea',
    rows: 2,
    hint: 'One or two sentences shown at the top of the page.',
  },
  {
    name: 'contact_email',
    label: 'Contact email',
    type: 'email',
    hint: 'Shown in the contact section.',
    half: true,
  },
  {
    name: 'contact_phone',
    label: 'Contact phone',
    type: 'text',
    placeholder: '+91 98765 43210',
    hint: 'Optional. Shown in the contact section; tapping it starts a call.',
    half: true,
  },
  {
    name: 'about',
    label: 'About',
    type: 'textarea',
    rows: 8,
    hint: 'A few short paragraphs about you. Leave a blank line between paragraphs.',
  },
  {
    name: 'interests',
    label: 'Interests',
    type: 'tags',
    hint: 'Shown in the About section. Press Enter after each one.',
  },
  { name: 'avatar_path', label: 'Profile photo', type: 'image', folder: 'profile', aspect: 'square' },
  {
    name: 'is_open_to_work',
    label: 'Show "Open to Opportunities" badge',
    type: 'checkbox',
  },
]

const schema = z.object({
  full_name: requiredText('Full name'),
  location: z.string().trim().max(200, 'Location is too long'),
  headline: z.string().trim().max(200, 'Headline is too long'),
  contact_email: optionalEmail,
  contact_phone: optionalText.refine(
    (value) => !value || /^\+?[0-9][0-9 ()-]{6,19}$/.test(value),
    'Enter a valid phone number, e.g. +91 98765 43210',
  ),
  summary: z.string().trim().max(400, 'Keep the intro under 400 characters'),
  about: z.string().trim().max(5000, 'About is too long'),
  interests: tagList,
  avatar_path: imagePath,
  is_open_to_work: z.boolean(),
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
            summary: profile.data.summary,
            interests: profile.data.interests,
            is_open_to_work: profile.data.is_open_to_work,
            contact_email: profile.data.contact_email ?? '',
            contact_phone: profile.data.contact_phone ?? '',
            about: profile.data.about,
            avatar_path: profile.data.avatar_path,
          }}
          onSave={(payload) => updateProfile(payload)}
        />
      )}
    </>
  )
}
