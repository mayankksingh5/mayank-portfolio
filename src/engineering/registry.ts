import type { ProjectEngineering } from '@/engineering/types'

type EngineeringEntry = {
  /** Shows the "Engineering View" link and page for this project. */
  enabled: boolean
  load: () => Promise<{ default: ProjectEngineering }>
}

/**
 * Engineering View per project slug (the slug set in Admin > Projects).
 * Data files are loaded on demand, so the home page only ships this map.
 */
const entries = new Map<string, EngineeringEntry>([
  ['mayank-portfolio', { enabled: true, load: () => import('@/engineering/projects/mayank-portfolio') }],
])

export function hasEngineeringView(slug: string) {
  return entries.get(slug)?.enabled === true
}

export async function loadEngineering(slug: string): Promise<ProjectEngineering | null> {
  const entry = entries.get(slug)
  if (!entry?.enabled) return null
  return (await entry.load()).default
}

export function engineeringPath(slug: string) {
  return `/projects/${encodeURIComponent(slug)}/engineering`
}
