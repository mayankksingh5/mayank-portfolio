/**
 * Database types matching supabase/migrations. Keep in sync when the schema
 * changes (or regenerate with `supabase gen types typescript`).
 */

type Timestamps = {
  created_at: string
  updated_at: string
}

type Ordered = {
  display_order: number
  is_published: boolean
}

export type Profile = Timestamps & {
  id: number
  full_name: string
  headline: string
  about: string
  location: string
  contact_email: string | null
  avatar_path: string | null
  summary: string
  is_open_to_work: boolean
  interests: string[]
}

export type SiteSettings = Timestamps & {
  id: number
  site_title: string
  meta_description: string
  og_image_path: string | null
  resume_path: string | null
  resume_file_name: string | null
  resume_updated_at: string | null
}

export type Experience = Timestamps &
  Ordered & {
    id: string
    company: string
    role: string
    employment_type: string | null
    location: string | null
    company_url: string | null
    logo_path: string | null
    start_date: string
    end_date: string | null
    is_current: boolean
    description: string
    technologies: string[]
  }

export type Project = Timestamps &
  Ordered & {
    id: string
    title: string
    slug: string
    summary: string
    description: string
    thumbnail_path: string | null
    live_url: string | null
    github_url: string | null
    is_featured: boolean
  }

export type Technology = Timestamps & {
  id: string
  name: string
}

export type ProjectTechnology = {
  project_id: string
  technology_id: string
  display_order: number
  created_at: string
}

export type SkillCategory = Timestamps &
  Ordered & {
    id: string
    name: string
  }

export type Skill = Timestamps &
  Ordered & {
    id: string
    category_id: string
    name: string
  }

export type Education = Timestamps &
  Ordered & {
    id: string
    institution: string
    degree: string
    field_of_study: string | null
    location: string | null
    grade: string | null
    logo_path: string | null
    start_date: string | null
    end_date: string | null
    description: string
  }

export type Certification = Timestamps &
  Ordered & {
    id: string
    name: string
    issuer: string
    issue_date: string | null
    expiry_date: string | null
    credential_id: string | null
    credential_url: string | null
    image_path: string | null
    icon: string | null
  }

export type Achievement = Timestamps &
  Ordered & {
    id: string
    title: string
    description: string
    achieved_on: string | null
    url: string | null
    image_path: string | null
    icon: string | null
  }

export const SOCIAL_PLATFORMS = [
  'github',
  'linkedin',
  'leetcode',
  'email',
  'twitter',
  'website',
  'other',
] as const

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]

export type SocialLink = Timestamps &
  Ordered & {
    id: string
    platform: SocialPlatform
    label: string
    url: string
  }

export type Stat = Timestamps &
  Ordered & {
    id: string
    value: string
    unit: string | null
    label: string
  }

export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

/** Insert requires `Required` columns; everything else has a DB default. */
type Table<Row, Required extends keyof Row, Relationships extends Relationship[] = []> = {
  Row: Row
  Insert: Partial<Row> & Pick<Row, Required>
  Update: Partial<Row>
  Relationships: Relationships
}

export type Database = {
  public: {
    Tables: {
      profile: Table<Profile, never>
      site_settings: Table<SiteSettings, never>
      experiences: Table<Experience, 'company' | 'role' | 'start_date'>
      projects: Table<Project, 'title' | 'slug'>
      technologies: Table<Technology, 'name'>
      project_technologies: Table<
        ProjectTechnology,
        'project_id' | 'technology_id',
        [
          {
            foreignKeyName: 'project_technologies_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_technologies_technology_id_fkey'
            columns: ['technology_id']
            isOneToOne: false
            referencedRelation: 'technologies'
            referencedColumns: ['id']
          },
        ]
      >
      skill_categories: Table<SkillCategory, 'name'>
      skills: Table<
        Skill,
        'category_id' | 'name',
        [
          {
            foreignKeyName: 'skills_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'skill_categories'
            referencedColumns: ['id']
          },
        ]
      >
      education: Table<Education, 'institution' | 'degree'>
      certifications: Table<Certification, 'name' | 'issuer'>
      achievements: Table<Achievement, 'title'>
      social_links: Table<SocialLink, 'platform' | 'label' | 'url'>
      stats: Table<Stat, 'value' | 'label'>
      contact_messages: Table<ContactMessage, 'name' | 'email' | 'message'>
    }
    Views: { [_ in never]: never }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type TableName = keyof Database['public']['Tables']
