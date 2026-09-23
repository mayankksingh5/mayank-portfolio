import { smallPrimaryButton, smallSecondaryButton } from '@/components/buttonStyles'
import { ExternalLinkIcon, GithubIcon } from '@/components/icons'
import { ProjectPreview } from '@/components/ProjectPreview'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/SectionHeading'
import { TagList } from '@/components/Tag'
import type { ProjectWithTechnologies } from '@/services/projectShape'
import { publicUrl } from '@/lib/storageUrl'

const projectNumber = (index: number) => `Project ${String(index + 1).padStart(2, '0')}`

function hostname(url: string | null) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function ProjectLinks({ project, compact = false }: { project: ProjectWithTechnologies; compact?: boolean }) {
  if (!project.live_url && !project.github_url) return null
  return (
    <div className="flex flex-wrap gap-3">
      {project.live_url && (
        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className={smallPrimaryButton}>
          <ExternalLinkIcon />
          {compact ? 'Live Demo' : 'Live Project'}
          <span className="sr-only">: {project.title}</span>
        </a>
      )}
      {project.github_url && (
        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className={smallSecondaryButton}>
          <GithubIcon size={14} />
          GitHub
          <span className="sr-only">: {project.title}</span>
        </a>
      )}
    </div>
  )
}

export function ProjectsSection({ projects }: { projects: ProjectWithTechnologies[] }) {
  if (projects.length === 0) return null
  const featured = projects.find((project) => project.is_featured) ?? projects[0]
  const others = projects.filter((project) => project !== featured)

  return (
    <RevealSection id="projects" labelledBy="projects-heading" className="py-20">
      <SectionHeading id="projects-heading" label="What I've Built" title="Featured Projects" />

      <div className="mt-12 space-y-8">
        <FeaturedProject project={featured} index={projects.indexOf(featured)} />
        {others.map((project) => (
          <ProjectCard key={project.id} project={project} index={projects.indexOf(project)} />
        ))}
        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-white/10 p-8">
          <div className="text-center">
            <div aria-hidden="true" className="mb-2 text-2xl text-fg-subtle">
              +
            </div>
            <p className="text-sm text-fg-faint">More projects coming soon</p>
          </div>
        </div>
      </div>
    </RevealSection>
  )
}

function FeaturedProject({ project, index }: { project: ProjectWithTechnologies; index: number }) {
  const domain = hostname(project.live_url) ?? `${project.slug}`

  return (
    <article className="glass group overflow-hidden rounded-2xl border-brand/20! transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="grid lg:grid-cols-2">
        {/* Browser mockup */}
        <div className="flex min-h-64 flex-col border-white/6 bg-white/3 lg:border-r">
          <div aria-hidden="true" className="flex items-center gap-2 border-b border-white/6 bg-white/2 px-4 py-3">
            <span className="size-2.5 rounded-full bg-red-500/50" />
            <span className="size-2.5 rounded-full bg-yellow-500/50" />
            <span className="size-2.5 rounded-full bg-green-500/50" />
            <span className="mx-4 flex-1 truncate rounded bg-white/5 px-3 py-1 text-xs text-fg-subtle">
              {domain}
            </span>
          </div>
          {project.thumbnail_path ? (
            <img
              src={publicUrl('media', project.thumbnail_path)}
              alt={`Screenshot of ${project.title}`}
              loading="lazy"
              decoding="async"
              className="aspect-video w-full flex-1 object-cover object-top"
            />
          ) : (
            <ProjectPreview title={project.title} />
          )}
        </div>

        <div className="flex flex-col justify-between p-8">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-mono text-xs text-brand">{projectNumber(index)}</span>
              {project.is_featured && (
                <span className="rounded bg-brand/15 px-2 py-0.5 text-xs text-brand">Featured</span>
              )}
            </div>
            <h3 className="mb-1 font-display text-2xl font-bold">{project.title}</h3>
            {project.summary && <p className="mb-4 text-sm font-medium text-brand-alt">{project.summary}</p>}
            {project.description && (
              <p className="mb-6 text-sm leading-relaxed whitespace-pre-line text-fg-muted">{project.description}</p>
            )}
            <div className="mb-6">
              <TagList tags={project.technologies} />
            </div>
          </div>
          <ProjectLinks project={project} />
        </div>
      </div>
    </article>
  )
}

function ProjectCard({ project, index }: { project: ProjectWithTechnologies; index: number }) {
  return (
    <article className="glass rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1">
      <div className="grid gap-8 sm:grid-cols-3">
        <div className="flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-brand-alt/20 bg-linear-to-br from-brand-alt/15 to-brand/5">
          {project.thumbnail_path ? (
            <img
              src={publicUrl('media', project.thumbnail_path)}
              alt={`Screenshot of ${project.title}`}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ) : (
            <span aria-hidden="true" className="text-gradient-brand font-display text-3xl font-bold">
              {project.title.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex flex-col justify-between sm:col-span-2">
          <div>
            <p className="mb-2 font-mono text-xs text-fg-subtle">{projectNumber(index)}</p>
            <h3 className="mb-3 font-display text-xl font-bold">{project.title}</h3>
            <p className="mb-4 text-sm leading-relaxed whitespace-pre-line text-fg-muted">
              {project.description || project.summary}
            </p>
            <div className="mb-4">
              <TagList tags={project.technologies} />
            </div>
          </div>
          <ProjectLinks project={project} compact />
        </div>
      </div>
    </article>
  )
}
