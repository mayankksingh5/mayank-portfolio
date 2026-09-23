import { z } from 'zod'
import { CollectionManager, type CollectionConfig } from '@/admin/collection/CollectionManager'
import { PageHeader } from '@/admin/components/PageHeader'
import { optionalText } from '@/admin/forms/validation'
import { createCollectionService } from '@/services/collection'
import type { Stat } from '@/types/database'

const config: CollectionConfig<Stat> = {
  itemName: 'stat',
  service: createCollectionService<Stat>('stats'),
  fields: [
    { name: 'value', label: 'Value', type: 'text', required: true, half: true, placeholder: 'e.g. 93 or 4★' },
    { name: 'unit', label: 'Unit', type: 'text', half: true, placeholder: 'e.g. Days', hint: 'Optional, shown smaller.' },
    { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'e.g. LeetCode Completion Streak' },
    { name: 'is_published', label: 'Show on portfolio', type: 'checkbox' },
  ],
  schema: z.object({
    value: z.string().trim().min(1, 'Value is required').max(20, 'Keep the value under 20 characters'),
    unit: optionalText.refine((value) => !value || value.length <= 20, 'Keep the unit under 20 characters'),
    label: z.string().trim().min(1, 'Label is required').max(60, 'Keep the label under 60 characters'),
    is_published: z.boolean(),
  }),
  emptyValues: { value: '', unit: '', label: '', is_published: true },
  toValues: (row) => ({
    value: row.value,
    unit: row.unit ?? '',
    label: row.label,
    is_published: row.is_published,
  }),
  summarize: (row) => ({ title: [row.value, row.unit].filter(Boolean).join(' '), subtitle: row.label }),
  emptyMessage: 'No stats yet. Add 3–4 short numbers such as years of experience or a coding streak.',
}

export default function StatsPage() {
  return (
    <>
      <PageHeader title="Stats" description="Short highlight numbers shown under the hero section." />
      <CollectionManager config={config} />
    </>
  )
}
