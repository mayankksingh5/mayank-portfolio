import { hasEngineeringView, loadEngineering } from '@/engineering/registry'
import type { ProjectEngineering } from '@/engineering/types'
import { publicDb } from '@/lib/publicDb'
import type { Project } from '@/types/database'

export type EngineeringPageData = {
  project: Pick<Project, 'title' | 'slug' | 'live_url' | 'github_url'>
  engineering: ProjectEngineering
}

/**
 * Loads a project's Engineering View. Returns null (404) unless the view is
 * enabled and the project is published, so hidden projects never show up here.
 */
export async function fetchEngineeringPage(slug: string): Promise<EngineeringPageData | null> {
  if (!hasEngineeringView(slug)) return null

  const [project, engineering] = await Promise.all([
    publicDb
      .from('projects')
      .select('title, slug, live_url, github_url')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle(),
    loadEngineering(slug),
  ])
  if (project.error) throw project.error
  if (!project.data || !engineering) return null
  return { project: project.data, engineering }
}
