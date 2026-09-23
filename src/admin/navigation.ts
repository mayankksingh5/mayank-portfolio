export type AdminSection = {
  /** Path relative to /admin ('' is the dashboard). */
  path: string
  label: string
  description: string
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { path: '', label: 'Dashboard', description: 'Overview of your portfolio content.' },
  { path: 'profile', label: 'Profile', description: 'Name, headline, about, location and photo.' },
  { path: 'experience', label: 'Experience', description: 'Work history shown on the portfolio.' },
  { path: 'projects', label: 'Projects', description: 'Projects, screenshots, links and tech tags.' },
  { path: 'skills', label: 'Skills', description: 'Skills grouped by category.' },
  { path: 'education', label: 'Education', description: 'Degrees and schools.' },
  { path: 'certifications', label: 'Certifications', description: 'Certificates and credential links.' },
  { path: 'achievements', label: 'Achievements', description: 'Awards and notable achievements.' },
  { path: 'resume', label: 'Resume', description: 'Upload or replace the downloadable resume PDF.' },
  { path: 'social-links', label: 'Social Links', description: 'GitHub, LinkedIn, LeetCode, email and more.' },
  { path: 'settings', label: 'Settings', description: 'Site title, SEO description and share image.' },
]

export const adminHref = (path: string) => (path ? `/admin/${path}` : '/admin')
