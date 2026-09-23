import { z } from 'zod'
import { CollectionManager, type CollectionConfig } from '@/admin/collection/CollectionManager'
import { PageHeader } from '@/admin/components/PageHeader'
import { requiredText } from '@/admin/forms/validation'
import { createCollectionService } from '@/services/collection'
import { SOCIAL_PLATFORMS, type SocialLink } from '@/types/database'

const PLATFORM_LABELS: Record<(typeof SOCIAL_PLATFORMS)[number], string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  leetcode: 'LeetCode',
  email: 'Email',
  twitter: 'X / Twitter',
  website: 'Website',
  other: 'Other',
}

const PLATFORM_OPTIONS = SOCIAL_PLATFORMS.map((value) => ({ value, label: PLATFORM_LABELS[value] }))

const schema = z
  .object({
    platform: z.enum(SOCIAL_PLATFORMS),
    label: requiredText('Label'),
    url: z.string().trim().min(1, 'Link is required'),
    is_published: z.boolean(),
  })
  .transform((values) => {
    // Let people type a plain email address for the Email platform.
    const isPlainEmail = values.platform === 'email' && !/^mailto:/i.test(values.url)
    return { ...values, url: isPlainEmail ? `mailto:${values.url}` : values.url }
  })
  .superRefine((values, ctx) => {
    const valid =
      values.platform === 'email'
        ? /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(values.url)
        : /^https?:\/\/\S+\.\S+$/i.test(values.url)
    if (!valid) {
      ctx.addIssue({
        code: 'custom',
        path: ['url'],
        message:
          values.platform === 'email'
            ? 'Enter a valid email address'
            : 'Enter a full link starting with https://',
      })
    }
  })

const config: CollectionConfig<SocialLink> = {
  itemName: 'link',
  service: createCollectionService<SocialLink>('social_links'),
  fields: [
    { name: 'platform', label: 'Platform', type: 'select', options: PLATFORM_OPTIONS, required: true, half: true },
    { name: 'label', label: 'Label', type: 'text', required: true, half: true, placeholder: 'e.g. GitHub' },
    {
      name: 'url',
      label: 'Link',
      type: 'text',
      required: true,
      placeholder: 'https://… or you@example.com',
      hint: 'For Email, just type the email address.',
    },
    { name: 'is_published', label: 'Show on portfolio', type: 'checkbox' },
  ],
  schema,
  emptyValues: { platform: 'github', label: '', url: '', is_published: true },
  toValues: (row) => ({
    platform: row.platform,
    label: row.label,
    url: row.platform === 'email' ? row.url.replace(/^mailto:/i, '') : row.url,
    is_published: row.is_published,
  }),
  summarize: (row) => ({
    title: row.label,
    subtitle: row.url.replace(/^mailto:/i, ''),
    badges: [PLATFORM_LABELS[row.platform]],
  }),
  emptyMessage: 'No links yet. Add GitHub, LinkedIn, LeetCode and your email.',
}

export default function SocialLinksPage() {
  return (
    <>
      <PageHeader title="Social Links" description="Links shown in the header, footer and contact section." />
      <CollectionManager config={config} />
    </>
  )
}
