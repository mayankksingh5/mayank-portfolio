import { publicUrl } from '@/lib/storageUrl'
import type { PortfolioData } from '@/services/portfolio'

/** schema.org Person data so search engines understand who the site is about. */
export function PersonSchema({ data, jobTitle }: { data: PortfolioData; jobTitle: string }) {
  const { profile, experiences, education, socialLinks } = data
  const current = experiences.find((experience) => experience.is_current)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.full_name,
    jobTitle: jobTitle || undefined,
    description: profile.summary || undefined,
    url: window.location.origin,
    email: profile.contact_email ? `mailto:${profile.contact_email}` : undefined,
    image: profile.avatar_path ? publicUrl('media', profile.avatar_path) : undefined,
    address: profile.location ? { '@type': 'PostalAddress', addressCountry: profile.location } : undefined,
    worksFor: current ? { '@type': 'Organization', name: current.company } : undefined,
    alumniOf: education.map((item) => ({ '@type': 'EducationalOrganization', name: item.institution })),
    knowsAbout: data.skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)),
    sameAs: socialLinks.filter((link) => link.url.startsWith('http')).map((link) => link.url),
  }

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  )
}
