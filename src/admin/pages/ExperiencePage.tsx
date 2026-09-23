import { z } from 'zod'
import { CollectionManager, type CollectionConfig } from '@/admin/collection/CollectionManager'
import { PageHeader } from '@/admin/components/PageHeader'
import {
  endAfterStart,
  imagePath,
  longText,
  optionalDate,
  optionalText,
  optionalUrl,
  requiredDate,
  requiredText,
  tagList,
} from '@/admin/forms/validation'
import { formatDateRange } from '@/lib/format'
import { createCollectionService } from '@/services/collection'
import type { Experience } from '@/types/database'

const EMPLOYMENT_TYPES = [
  { value: '', label: 'Not specified' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
] as const

const config: CollectionConfig<Experience> = {
  itemName: 'experience',
  service: createCollectionService<Experience>('experiences', { imageColumns: ['logo_path'] }),
  fields: [
    { name: 'role', label: 'Role / title', type: 'text', required: true, half: true },
    { name: 'company', label: 'Company', type: 'text', required: true, half: true },
    { name: 'employment_type', label: 'Employment type', type: 'select', options: EMPLOYMENT_TYPES, half: true },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'e.g. Bengaluru, Remote', half: true },
    { name: 'start_date', label: 'Start date', type: 'date', required: true, half: true },
    { name: 'end_date', label: 'End date', type: 'date', hint: 'Leave empty if you still work here.', half: true },
    { name: 'is_current', label: 'I currently work here', type: 'checkbox' },
    { name: 'company_url', label: 'Company website', type: 'url', placeholder: 'https://' },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 6,
      hint: 'Put each responsibility or achievement on its own line.',
    },
    {
      name: 'technologies',
      label: 'Technologies used',
      type: 'tags',
      hint: 'Press Enter after each one, e.g. AWS, Docker.',
    },
    { name: 'logo_path', label: 'Company logo', type: 'image', folder: 'experience', aspect: 'square' },
    { name: 'is_published', label: 'Show on portfolio', type: 'checkbox' },
  ],
  schema: z
    .object({
      role: requiredText('Role'),
      company: requiredText('Company'),
      employment_type: optionalText,
      location: optionalText,
      start_date: requiredDate('Start date'),
      end_date: optionalDate,
      is_current: z.boolean(),
      company_url: optionalUrl,
      description: longText,
      technologies: tagList,
      logo_path: imagePath,
      is_published: z.boolean(),
    })
    .superRefine(endAfterStart('start_date', 'end_date', 'End date must be after the start date'))
    .transform((values) => ({ ...values, end_date: values.is_current ? null : values.end_date })),
  emptyValues: {
    role: '',
    company: '',
    employment_type: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    company_url: '',
    description: '',
    technologies: [],
    logo_path: null,
    is_published: true,
  },
  toValues: (row) => ({
    role: row.role,
    company: row.company,
    employment_type: row.employment_type ?? '',
    location: row.location ?? '',
    start_date: row.start_date,
    end_date: row.end_date ?? '',
    is_current: row.is_current,
    company_url: row.company_url ?? '',
    description: row.description,
    technologies: row.technologies,
    logo_path: row.logo_path,
    is_published: row.is_published,
  }),
  summarize: (row) => ({
    title: row.role,
    subtitle: [row.company, row.employment_type].filter(Boolean).join(' · '),
    meta: formatDateRange(row.start_date, row.end_date, row.is_current),
    imagePath: row.logo_path,
  }),
}

export default function ExperiencePage() {
  return (
    <>
      <PageHeader title="Experience" description="Your work history, newest first." />
      <CollectionManager config={config} />
    </>
  )
}
