import { z } from 'zod'
import { CollectionManager, type CollectionConfig } from '@/admin/collection/CollectionManager'
import { PageHeader } from '@/admin/components/PageHeader'
import {
  endAfterStart,
  imagePath,
  optionalDate,
  optionalText,
  optionalUrl,
  requiredText,
} from '@/admin/forms/validation'
import { formatMonthYear } from '@/lib/format'
import { createCollectionService } from '@/services/collection'
import type { Certification } from '@/types/database'

const config: CollectionConfig<Certification> = {
  itemName: 'certification',
  service: createCollectionService<Certification>('certifications', { imageColumns: ['image_path'] }),
  fields: [
    { name: 'name', label: 'Certification name', type: 'text', required: true },
    { name: 'issuer', label: 'Issued by', type: 'text', required: true, half: true, placeholder: 'e.g. AWS, Coursera' },
    { name: 'credential_id', label: 'Credential ID', type: 'text', half: true },
    { name: 'issue_date', label: 'Issue date', type: 'date', half: true },
    { name: 'expiry_date', label: 'Expiry date', type: 'date', half: true, hint: 'Leave empty if it does not expire.' },
    { name: 'credential_url', label: 'Credential URL', type: 'url', placeholder: 'https://' },
    { name: 'image_path', label: 'Certificate image', type: 'image', folder: 'certifications' },
    { name: 'is_published', label: 'Show on portfolio', type: 'checkbox' },
  ],
  schema: z
    .object({
      name: requiredText('Certification name'),
      issuer: requiredText('Issuer'),
      credential_id: optionalText,
      issue_date: optionalDate,
      expiry_date: optionalDate,
      credential_url: optionalUrl,
      image_path: imagePath,
      is_published: z.boolean(),
    })
    .superRefine(endAfterStart('issue_date', 'expiry_date', 'Expiry date must be after the issue date')),
  emptyValues: {
    name: '',
    issuer: '',
    credential_id: '',
    issue_date: '',
    expiry_date: '',
    credential_url: '',
    image_path: null,
    is_published: true,
  },
  toValues: (row) => ({
    name: row.name,
    issuer: row.issuer,
    credential_id: row.credential_id ?? '',
    issue_date: row.issue_date ?? '',
    expiry_date: row.expiry_date ?? '',
    credential_url: row.credential_url ?? '',
    image_path: row.image_path,
    is_published: row.is_published,
  }),
  summarize: (row) => ({
    title: row.name,
    subtitle: row.issuer,
    meta: row.issue_date ? `Issued ${formatMonthYear(row.issue_date)}` : undefined,
    imagePath: row.image_path,
  }),
}

export default function CertificationsPage() {
  return (
    <>
      <PageHeader title="Certifications" description="Certificates with credential links." />
      <CollectionManager config={config} />
    </>
  )
}
