import { supabase } from '@/lib/supabase'
import { countUnreadMessages } from '@/services/messages'

const COUNTED_TABLES = [
  'experiences',
  'projects',
  'skills',
  'education',
  'certifications',
  'achievements',
  'social_links',
  'stats',
] as const

export type CountedTable = (typeof COUNTED_TABLES)[number]

export type DashboardSummary = {
  counts: Record<CountedTable, number>
  resumeFileName: string | null
  resumeUpdatedAt: string | null
  unreadMessages: number
}

async function countRows(table: CountedTable) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
  if (error) throw error
  return [table, count ?? 0] as const
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [counts, settings, unreadMessages] = await Promise.all([
    Promise.all(COUNTED_TABLES.map(countRows)),
    supabase.from('site_settings').select('resume_file_name, resume_updated_at').eq('id', 1).single(),
    countUnreadMessages(),
  ])
  if (settings.error) throw settings.error

  return {
    counts: Object.fromEntries(counts) as Record<CountedTable, number>,
    resumeFileName: settings.data.resume_file_name,
    resumeUpdatedAt: settings.data.resume_updated_at,
    unreadMessages,
  }
}
