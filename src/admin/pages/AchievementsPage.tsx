import { z } from 'zod'
import { CollectionManager, type CollectionConfig } from '@/admin/collection/CollectionManager'
import { PageHeader } from '@/admin/components/PageHeader'
import { imagePath, longText, optionalDate, optionalText, optionalUrl, requiredText } from '@/admin/forms/validation'
import { formatMonthYear } from '@/lib/format'
import { createCollectionService } from '@/services/collection'
import type { Achievement } from '@/types/database'

const config: CollectionConfig<Achievement> = {
  itemName: 'achievement',
  service: createCollectionService<Achievement>('achievements', { imageColumns: ['image_path'] }),
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
    { name: 'achieved_on', label: 'Date', type: 'date', half: true },
    { name: 'url', label: 'Link', type: 'url', placeholder: 'https://', half: true },
    { name: 'icon', label: 'Icon (emoji)', type: 'text', half: true, placeholder: 'e.g. ⭐', hint: 'Shown on the card. Optional.' },
    { name: 'image_path', label: 'Image', type: 'image', folder: 'achievements' },
    { name: 'is_published', label: 'Show on portfolio', type: 'checkbox' },
  ],
  schema: z.object({
    title: requiredText('Title'),
    description: longText,
    achieved_on: optionalDate,
    url: optionalUrl,
    icon: optionalText.refine((value) => !value || [...value].length <= 4, 'Use a single emoji'),
    image_path: imagePath,
    is_published: z.boolean(),
  }),
  emptyValues: {
    title: '',
    description: '',
    achieved_on: '',
    url: '',
    icon: '',
    image_path: null,
    is_published: true,
  },
  toValues: (row) => ({
    title: row.title,
    description: row.description,
    achieved_on: row.achieved_on ?? '',
    url: row.url ?? '',
    icon: row.icon ?? '',
    image_path: row.image_path,
    is_published: row.is_published,
  }),
  summarize: (row) => ({
    title: row.title,
    subtitle: row.description,
    meta: formatMonthYear(row.achieved_on) || undefined,
    imagePath: row.image_path,
  }),
}

export default function AchievementsPage() {
  return (
    <>
      <PageHeader title="Achievements" description="Awards, rankings and notable achievements." />
      <CollectionManager config={config} />
    </>
  )
}
