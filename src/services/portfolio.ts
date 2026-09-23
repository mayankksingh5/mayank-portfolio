import { supabase } from '@/lib/supabase'
import {
  PROJECT_WITH_TECHNOLOGIES_SELECT,
  withTechnologyNames,
  type ProjectQueryRow,
  type ProjectWithTechnologies,
} from '@/services/projects'
import { resumeDownloadUrl } from '@/services/siteContent'
import type {
  Achievement,
  Certification,
  Education,
  Experience,
  Profile,
  SiteSettings,
  Skill,
  SkillCategory,
  SocialLink,
  Stat,
} from '@/types/database'

export type SkillGroup = { category: SkillCategory; skills: Skill[] }

export type PortfolioData = {
  profile: Profile
  settings: SiteSettings
  resumeUrl: string | null
  stats: Stat[]
  experiences: Experience[]
  projects: ProjectWithTechnologies[]
  skillGroups: SkillGroup[]
  education: Education[]
  certifications: Certification[]
  achievements: Achievement[]
  socialLinks: SocialLink[]
}

function unwrap<T>(result: { data: T | null; error: unknown }): T {
  if (result.error) throw result.error
  return result.data as T
}

/**
 * Loads everything the public page needs in parallel. Filters on
 * is_published explicitly so a signed-in admin previewing the site still
 * sees exactly what visitors see (RLS alone would show admins hidden rows).
 */
export async function fetchPortfolio(): Promise<PortfolioData> {
  const [
    profile,
    settings,
    stats,
    experiences,
    projects,
    categories,
    skills,
    education,
    certifications,
    achievements,
    socialLinks,
  ] = await Promise.all([
    supabase.from('profile').select('*').eq('id', 1).single(),
    supabase.from('site_settings').select('*').eq('id', 1).single(),
    supabase.from('stats').select('*').eq('is_published', true).order('display_order'),
    supabase.from('experiences').select('*').eq('is_published', true).order('display_order'),
    supabase
      .from('projects')
      .select(PROJECT_WITH_TECHNOLOGIES_SELECT)
      .eq('is_published', true)
      .order('display_order'),
    supabase.from('skill_categories').select('*').eq('is_published', true).order('display_order'),
    supabase.from('skills').select('*').eq('is_published', true).order('display_order'),
    supabase.from('education').select('*').eq('is_published', true).order('display_order'),
    supabase.from('certifications').select('*').eq('is_published', true).order('display_order'),
    supabase.from('achievements').select('*').eq('is_published', true).order('display_order'),
    supabase.from('social_links').select('*').eq('is_published', true).order('display_order'),
  ])

  const settingsRow = unwrap(settings)
  const skillRows = unwrap(skills)

  return {
    profile: unwrap(profile),
    settings: settingsRow,
    resumeUrl: resumeDownloadUrl(settingsRow),
    stats: unwrap(stats),
    experiences: unwrap(experiences),
    projects: (unwrap(projects) as unknown as ProjectQueryRow[]).map(withTechnologyNames),
    skillGroups: unwrap(categories)
      .map((category) => ({
        category,
        skills: skillRows.filter((skill) => skill.category_id === category.id),
      }))
      .filter((group) => group.skills.length > 0),
    education: unwrap(education),
    certifications: unwrap(certifications),
    achievements: unwrap(achievements),
    socialLinks: unwrap(socialLinks),
  }
}
