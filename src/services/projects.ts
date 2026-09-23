import { supabase } from '@/lib/supabase'
import { createCollectionService, type CollectionService, type Payload } from '@/services/collection'
import type { Project } from '@/types/database'

export type ProjectWithTechnologies = Project & { technologies: string[] }

const base = createCollectionService<Project>('projects', { imageColumns: ['thumbnail_path'] })

/** Select that embeds each project's technology names in order. */
export const PROJECT_WITH_TECHNOLOGIES_SELECT = '*, project_technologies(display_order, technologies(name))'

export type ProjectQueryRow = Project & {
  project_technologies: { display_order: number; technologies: { name: string } | null }[]
}

export function withTechnologyNames(row: ProjectQueryRow): ProjectWithTechnologies {
  const { project_technologies, ...project } = row
  return {
    ...project,
    technologies: [...project_technologies]
      .sort((a, b) => a.display_order - b.display_order)
      .map((link) => link.technologies?.name)
      .filter((name): name is string => Boolean(name)),
  }
}

export async function listTechnologyNames() {
  const { data, error } = await supabase.from('technologies').select('name').order('name')
  if (error) throw error
  return data.map((row) => row.name)
}

/** Creates any missing technologies (case-insensitive) and returns ids in the given order. */
async function resolveTechnologyIds(names: string[]) {
  const { data: existing, error } = await supabase.from('technologies').select('id, name')
  if (error) throw error

  const idsByName = new Map(existing.map((tech) => [tech.name.toLowerCase(), tech.id]))
  const missing = names.filter((name) => !idsByName.has(name.toLowerCase()))

  if (missing.length > 0) {
    const { data: created, error: insertError } = await supabase
      .from('technologies')
      .insert(missing.map((name) => ({ name })))
      .select('id, name')
    if (insertError) throw insertError
    for (const tech of created) idsByName.set(tech.name.toLowerCase(), tech.id)
  }

  return names.map((name) => idsByName.get(name.toLowerCase())!)
}

async function setProjectTechnologies(projectId: string, names: string[]) {
  const technologyIds = await resolveTechnologyIds(names)

  const { error: deleteError } = await supabase
    .from('project_technologies')
    .delete()
    .eq('project_id', projectId)
  if (deleteError) throw deleteError

  if (technologyIds.length === 0) return
  const { error } = await supabase.from('project_technologies').insert(
    technologyIds.map((technology_id, index) => ({
      project_id: projectId,
      technology_id,
      display_order: index,
    })),
  )
  if (error) throw error
}

function splitPayload(payload: Payload) {
  const { technologies, ...project } = payload
  return { project, technologies: (technologies as string[] | undefined) ?? [] }
}

export const projectsService: CollectionService<ProjectWithTechnologies> = {
  async list() {
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_WITH_TECHNOLOGIES_SELECT)
      .order('display_order')
      .order('created_at')
    if (error) throw error
    return (data as unknown as ProjectQueryRow[]).map(withTechnologyNames)
  },

  async create(payload, displayOrder) {
    const { project, technologies } = splitPayload(payload)
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...(project as Pick<Project, 'title' | 'slug'>), display_order: displayOrder })
      .select('id')
      .single()
    if (error) throw error
    await setProjectTechnologies(data.id, technologies)
  },

  async update(id, payload) {
    const { project, technologies } = splitPayload(payload)
    await base.update(id, project)
    await setProjectTechnologies(id, technologies)
  },

  remove: (row) => base.remove(row),
  reorder: (rows) => base.reorder(rows),
}
