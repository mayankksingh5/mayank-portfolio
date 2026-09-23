import { z } from 'zod'
import { CollectionManager, type CollectionConfig } from '@/admin/collection/CollectionManager'
import { PageHeader } from '@/admin/components/PageHeader'
import {
  endAfterStart,
  imagePath,
  longText,
  optionalDate,
  optionalText,
  requiredText,
} from '@/admin/forms/validation'
import { formatDateRange } from '@/lib/format'
import { createCollectionService } from '@/services/collection'
import type { Education } from '@/types/database'

const config: CollectionConfig<Education> = {
  itemName: 'education',
  service: createCollectionService<Education>('education', { imageColumns: ['logo_path'] }),
  fields: [
    { name: 'institution', label: 'School / university', type: 'text', required: true },
    { name: 'degree', label: 'Degree', type: 'text', required: true, half: true, placeholder: 'e.g. B.Tech' },
    { name: 'field_of_study', label: 'Field of study', type: 'text', half: true, placeholder: 'e.g. Computer Science' },
    { name: 'start_date', label: 'Start date', type: 'date', half: true },
    { name: 'end_date', label: 'End date (or expected)', type: 'date', half: true },
    { name: 'grade', label: 'Grade / CGPA', type: 'text', half: true },
    { name: 'location', label: 'Location', type: 'text', half: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4, hint: 'Optional: coursework, activities, honours.' },
    { name: 'logo_path', label: 'Logo', type: 'image', folder: 'education', aspect: 'square' },
    { name: 'is_published', label: 'Show on portfolio', type: 'checkbox' },
  ],
  schema: z
    .object({
      institution: requiredText('School / university'),
      degree: requiredText('Degree'),
      field_of_study: optionalText,
      start_date: optionalDate,
      end_date: optionalDate,
      grade: optionalText,
      location: optionalText,
      description: longText,
      logo_path: imagePath,
      is_published: z.boolean(),
    })
    .superRefine(endAfterStart('start_date', 'end_date', 'End date must be after the start date')),
  emptyValues: {
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    grade: '',
    location: '',
    description: '',
    logo_path: null,
    is_published: true,
  },
  toValues: (row) => ({
    institution: row.institution,
    degree: row.degree,
    field_of_study: row.field_of_study ?? '',
    start_date: row.start_date ?? '',
    end_date: row.end_date ?? '',
    grade: row.grade ?? '',
    location: row.location ?? '',
    description: row.description,
    logo_path: row.logo_path,
    is_published: row.is_published,
  }),
  summarize: (row) => ({
    title: row.institution,
    subtitle: [row.degree, row.field_of_study].filter(Boolean).join(', '),
    meta: formatDateRange(row.start_date, row.end_date),
    imagePath: row.logo_path,
  }),
}

export default function EducationPage() {
  return (
    <>
      <PageHeader title="Education" description="Degrees, schools and universities." />
      <CollectionManager config={config} />
    </>
  )
}
