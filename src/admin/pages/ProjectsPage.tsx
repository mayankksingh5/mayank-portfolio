import { useMemo } from 'react'
import { z } from 'zod'
import { CollectionManager, type CollectionConfig } from '@/admin/collection/CollectionManager'
import { PageHeader } from '@/admin/components/PageHeader'
import type { FieldConfig } from '@/admin/forms/types'
import { imagePath, longText, optionalUrl, requiredText, tagList } from '@/admin/forms/validation'
import { useAsyncData } from '@/hooks/useAsyncData'
import { slugify } from '@/lib/format'
import {
  listTechnologyNames,
  projectsService,
  type ProjectWithTechnologies,
} from '@/services/projects'

const schema = z
  .object({
    title: requiredText('Title'),
    slug: z.string().trim(),
    summary: z.string().trim().max(300, 'Keep the summary under 300 characters'),
    description: longText,
    live_url: optionalUrl,
    github_url: optionalUrl,
    technologies: tagList,
    thumbnail_path: imagePath,
    is_featured: z.boolean(),
    is_published: z.boolean(),
  })
  .transform((values) => ({ ...values, slug: slugify(values.slug || values.title) }))
  .refine((values) => values.slug.length > 0, {
    path: ['slug'],
    message: 'Use letters or numbers in the slug',
  })

function buildFields(suggestions: string[]): FieldConfig[] {
  return [
    { name: 'title', label: 'Title', type: 'text', required: true, half: true },
    {
      name: 'slug',
      label: 'Slug',
      type: 'text',
      half: true,
      placeholder: 'my-project',
      hint: 'Short ID used in links. Leave empty to create it from the title.',
    },
    {
      name: 'summary',
      label: 'Short summary',
      type: 'textarea',
      rows: 2,
      hint: 'One or two sentences shown on the project card.',
    },
    { name: 'description', label: 'Full description', type: 'textarea', rows: 6 },
    { name: 'live_url', label: 'Live project URL', type: 'url', placeholder: 'https://', half: true },
    { name: 'github_url', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/…', half: true },
    {
      name: 'technologies',
      label: 'Technologies',
      type: 'tags',
      suggestions,
      hint: 'Press Enter or comma after each one. Existing tags are suggested.',
    },
    { name: 'thumbnail_path', label: 'Thumbnail / screenshot', type: 'image', folder: 'projects' },
    { name: 'is_featured', label: 'Featured project', type: 'checkbox', hint: 'Highlighted on the home page.' },
    { name: 'is_published', label: 'Show on portfolio', type: 'checkbox' },
  ]
}

export default function ProjectsPage() {
  const technologies = useAsyncData(listTechnologyNames)
  const suggestions = useMemo(() => technologies.data ?? [], [technologies.data])

  const config = useMemo<CollectionConfig<ProjectWithTechnologies>>(
    () => ({
      itemName: 'project',
      service: projectsService,
      fields: buildFields(suggestions),
      schema,
      emptyValues: {
        title: '',
        slug: '',
        summary: '',
        description: '',
        live_url: '',
        github_url: '',
        technologies: [],
        thumbnail_path: null,
        is_featured: false,
        is_published: true,
      },
      toValues: (row) => ({
        title: row.title,
        slug: row.slug,
        summary: row.summary,
        description: row.description,
        live_url: row.live_url ?? '',
        github_url: row.github_url ?? '',
        technologies: row.technologies,
        thumbnail_path: row.thumbnail_path,
        is_featured: row.is_featured,
        is_published: row.is_published,
      }),
      summarize: (row) => ({
        title: row.title,
        subtitle: row.summary,
        meta: row.technologies.join(', '),
        badges: row.is_featured ? ['Featured'] : [],
        imagePath: row.thumbnail_path,
      }),
    }),
    [suggestions],
  )

  return (
    <>
      <PageHeader title="Projects" description="Projects, screenshots, links and technology tags." />
      <CollectionManager config={config} />
    </>
  )
}
