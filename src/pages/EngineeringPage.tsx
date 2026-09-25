import { useCallback, useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { ErrorScreen, LoadingScreen } from '@/components/PageStatus'
import { ArchitectureDiagram } from '@/engineering/components/ArchitectureDiagram'
import { ChallengesSolutions } from '@/engineering/components/ChallengesSolutions'
import { DatabaseOverview } from '@/engineering/components/DatabaseOverview'
import { DataFlows } from '@/engineering/components/DataFlows'
import { DeploymentPipeline } from '@/engineering/components/DeploymentPipeline'
import { EngineeringHeader } from '@/engineering/components/EngineeringHeader'
import { EngineeringTimeline } from '@/engineering/components/EngineeringTimeline'
import { EngineeringSection, NoteGrid } from '@/engineering/components/layout'
import { PerformanceOverview } from '@/engineering/components/PerformanceOverview'
import { RepositoryCard } from '@/engineering/components/RepositoryCard'
import { TechStack } from '@/engineering/components/TechStack'
import { useAsyncData } from '@/hooks/useAsyncData'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'
import NotFoundPage from '@/pages/NotFoundPage'
import { fetchEngineeringPage, type EngineeringPageData } from '@/services/engineering'

export default function EngineeringPage() {
  const { slug = '' } = useParams()
  const loader = useCallback(() => fetchEngineeringPage(slug), [slug])
  const page = useAsyncData(loader)

  // Router navigation keeps the previous scroll position; start at the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (page.status === 'success' && !page.data) return <NotFoundPage />

  return (
    <div className="site">
      {page.status === 'loading' && <LoadingScreen label="Loading engineering view…" />}
      {page.status === 'error' && <ErrorScreen what="engineering view" onRetry={page.reload} />}
      {page.status === 'success' && page.data && <EngineeringView data={page.data} />}
    </div>
  )
}

type Section = { id: string; label: string; title: string; content: ReactNode }

function EngineeringView({ data }: { data: EngineeringPageData }) {
  const { project, engineering: e } = data
  const projectHref = `/#project-${project.slug}`

  useDocumentMeta({ title: `${project.title} · Engineering View`, description: e.tagline })

  const hasItems = (list?: unknown[]) => Boolean(list && list.length > 0)
  const performanceHasData = hasItems(e.performance?.metrics) || hasItems(e.performance?.techniques)

  // Only sections with data are rendered (and listed in the page index).
  const candidates: (Section | false | undefined)[] = [
    e.architecture && hasItems(e.architecture) && {
      id: 'architecture',
      label: 'How it fits together',
      title: 'System Architecture',
      content: <ArchitectureDiagram layers={e.architecture} />,
    },
    e.techStack && hasItems(e.techStack) && {
      id: 'stack',
      label: 'Built with',
      title: 'Tech Stack',
      content: <TechStack categories={e.techStack} />,
    },
    e.database && hasItems(e.database.entities) && {
      id: 'data',
      label: 'Data model',
      title: 'Database',
      content: <DatabaseOverview database={e.database} />,
    },
    e.dataFlows && hasItems(e.dataFlows) && {
      id: 'flow',
      label: 'Requests',
      title: 'API & Data Flow',
      content: <DataFlows flows={e.dataFlows} />,
    },
    e.features && hasItems(e.features) && {
      id: 'features',
      label: 'Implementation',
      title: 'Key Engineering Features',
      content: <NoteGrid notes={e.features} />,
    },
    e.challenges && hasItems(e.challenges) && {
      id: 'challenges',
      label: 'Problems solved',
      title: 'Challenges & Solutions',
      content: <ChallengesSolutions challenges={e.challenges} />,
    },
    e.performance && performanceHasData && {
      id: 'performance',
      label: 'Speed',
      title: 'Performance',
      content: <PerformanceOverview performance={e.performance} />,
    },
    e.security && hasItems(e.security) && {
      id: 'security',
      label: 'Safety',
      title: 'Security & Reliability',
      content: <NoteGrid notes={e.security} />,
    },
    e.deployment && hasItems(e.deployment.steps) && {
      id: 'deployment',
      label: 'Delivery',
      title: 'Deployment',
      content: <DeploymentPipeline deployment={e.deployment} />,
    },
    e.timeline && hasItems(e.timeline.milestones) && {
      id: 'timeline',
      label: 'History',
      title: 'Project Timeline',
      content: <EngineeringTimeline timeline={e.timeline} />,
    },
    e.repository && e.repository.visibility === 'public' && {
      id: 'repository',
      label: 'Source',
      title: 'Repository',
      content: <RepositoryCard repository={e.repository} />,
    },
  ]
  const sections = candidates.filter((section): section is Section => Boolean(section))

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <div className="sticky top-0 z-50 border-b border-white/6 bg-ink/85 backdrop-blur-xl">
        <nav aria-label="Engineering View" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to={projectHref} className="text-sm text-fg-muted transition-colors hover:text-white">
            ← Portfolio
          </Link>
          <p className="truncate font-mono text-xs text-fg-subtle">
            {project.title} <span className="text-brand">/ engineering</span>
          </p>
        </nav>
      </div>

      <main id="main" className="relative z-10 mx-auto max-w-6xl space-y-20 px-6 pt-12 pb-24 sm:pt-16">
        <EngineeringHeader
          title={project.title}
          tagline={e.tagline}
          status={e.status}
          liveUrl={project.live_url}
          githubUrl={project.github_url}
          projectHref={projectHref}
        />

        <section aria-labelledby="overview-heading" className="glass rounded-2xl p-6 sm:p-8">
          <h2 id="overview-heading" className="mb-3 font-mono text-xs text-brand-alt">
            Engineering overview
          </h2>
          <p className="max-w-4xl text-base leading-relaxed text-fg">{e.summary}</p>
          {sections.length > 1 && (
            <nav aria-label="On this page" className="mt-6 border-t border-white/6 pt-5">
              <ul className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="inline-block rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-brand/40 hover:text-white"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </section>

        {sections.map((section) => (
          <EngineeringSection key={section.id} id={section.id} label={section.label} title={section.title}>
            {section.content}
          </EngineeringSection>
        ))}
      </main>
    </>
  )
}
