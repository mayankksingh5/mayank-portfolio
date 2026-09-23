import type { Project } from '@/types/database'

export type ProjectWithTechnologies = Project & { technologies: string[] }

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
