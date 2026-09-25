import { useEffect, useMemo } from 'react'
import { ErrorScreen, LoadingScreen } from '@/components/PageStatus'
import { PersonSchema } from '@/components/PersonSchema'
import { useActiveSection } from '@/hooks/useActiveSection'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import { fetchPortfolio, type PortfolioData } from '@/services/portfolio'
import { publicUrl } from '@/lib/storageUrl'
import { About } from '@/sections/About'
import { AchievementsSection } from '@/sections/AchievementsSection'
import { CertificationsSection } from '@/sections/CertificationsSection'
import { ContactSection } from '@/sections/ContactSection'
import { EducationSection } from '@/sections/EducationSection'
import { ExperienceSection } from '@/sections/ExperienceSection'
import { Footer } from '@/sections/Footer'
import { Hero } from '@/sections/Hero'
import { Navbar, type NavLink } from '@/sections/Navbar'
import { ProjectsSection } from '@/sections/ProjectsSection'
import { ResumeSection } from '@/sections/ResumeSection'
import { SkillsSection } from '@/sections/SkillsSection'
import { Stats } from '@/sections/Stats'
import { WorkflowSection } from '@/sections/WorkflowSection'

export default function HomePage() {
  const portfolio = useAsyncData(fetchPortfolio)

  return (
    <div className="site">
      {portfolio.status === 'loading' && <LoadingScreen label="Loading portfolio…" />}
      {portfolio.status === 'error' && <ErrorScreen what="portfolio" onRetry={portfolio.reload} />}
      {portfolio.status === 'success' && <Portfolio data={portfolio.data} />}
    </div>
  )
}

function Portfolio({ data }: { data: PortfolioData }) {
  const { profile, settings, experiences, education, projects, skillGroups } = data

  const nameParts = profile.full_name.trim().split(/\s+/).filter(Boolean)
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : (nameParts[0]?.slice(0, 2).toUpperCase() ?? '')
  const shortName = nameParts.length > 2 ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}` : profile.full_name

  const roles = useMemo(
    () =>
      profile.headline
        .split('|')
        .map((role) => role.trim())
        .filter(Boolean),
    [profile.headline],
  )

  const current = experiences.find((experience) => experience.is_current) ?? experiences[0]
  const topEducation = education[0]

  const navLinks = useMemo<NavLink[]>(() => {
    const links: (NavLink & { show: boolean })[] = [
      { id: 'home', label: 'Home', show: true },
      { id: 'about', label: 'About', show: true },
      { id: 'experience', label: 'Experience', show: experiences.length > 0 },
      { id: 'projects', label: 'Projects', show: projects.length > 0 },
      { id: 'skills', label: 'Skills', show: skillGroups.length > 0 },
      { id: 'education', label: 'Education', show: education.length > 0 },
      { id: 'resume', label: 'Resume', show: Boolean(data.resumeUrl) },
      { id: 'contact', label: 'Contact', show: true },
    ]
    return links.filter((link) => link.show).map(({ id, label }) => ({ id, label }))
  }, [experiences.length, projects.length, skillGroups.length, education.length, data.resumeUrl])

  const activeId = useActiveSection(navLinks.map((link) => link.id))

  // Sections render after data loads, so jump to a #hash (e.g. from an
  // Engineering View's "Back to Project" link) once they exist.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [])

  useDocumentMeta({
    title: settings.site_title || profile.full_name,
    description: settings.meta_description || profile.summary,
    image: settings.og_image_path ? publicUrl('media', settings.og_image_path) : null,
  })

  const facts = [
    { label: 'Location', value: profile.location },
    { label: 'Current Role', value: current?.is_current ? current.role : '' },
    {
      label: 'Degree',
      value: topEducation
        ? [topEducation.degree, topEducation.field_of_study].filter(Boolean).join(' — ')
        : '',
    },
    { label: 'Company', value: current?.is_current ? current.company : '' },
  ].filter((fact) => fact.value)

  return (
    <>
      <PersonSchema data={data} jobTitle={current?.is_current ? current.role : (roles[0] ?? '')} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <Navbar
        initials={initials}
        shortName={shortName}
        links={navLinks}
        activeId={activeId}
        socialLinks={data.socialLinks}
        resumeUrl={data.resumeUrl}
      />
      <main id="main">
        <Hero
          name={profile.full_name}
          roles={roles}
          summary={profile.summary}
          openToWork={profile.is_open_to_work}
          socialLinks={data.socialLinks}
          resumeUrl={data.resumeUrl}
          currentRole={current?.role ?? roles[0] ?? ''}
          stack={(current?.technologies ?? []).slice(0, 4)}
          photoUrl={profile.avatar_path ? publicUrl('media', profile.avatar_path) : null}
        />
        <Stats stats={data.stats} />
        <About
          profile={profile}
          focusAreas={skillGroups.map((group) => group.category.name)}
          facts={facts}
        />
        <ExperienceSection experiences={experiences} />
        <ProjectsSection projects={projects} />
        <SkillsSection groups={skillGroups} />
        <WorkflowSection />
        <CertificationsSection certifications={data.certifications} />
        <AchievementsSection achievements={data.achievements} />
        <EducationSection education={education} />
        <ResumeSection
          name={profile.full_name}
          downloadUrl={data.resumeUrl}
          viewUrl={data.resumeViewUrl}
          fileName={settings.resume_file_name}
          updatedAt={settings.resume_updated_at}
          highlights={skillGroups.map((group) => group.category.name)}
        />
        <ContactSection email={profile.contact_email} phone={profile.contact_phone} socialLinks={data.socialLinks} resumeUrl={data.resumeUrl} />
      </main>
      <Footer
        name={shortName}
        tagline={roles.slice(0, 2).join(' & ')}
        links={navLinks.filter((link) => link.id !== 'about' && link.id !== 'education')}
        socialLinks={data.socialLinks}
      />
    </>
  )
}
