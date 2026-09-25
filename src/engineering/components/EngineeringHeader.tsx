import { Link } from 'react-router'
import { smallPrimaryButton, smallSecondaryButton } from '@/components/buttonStyles'
import { ExternalLinkIcon, GithubIcon } from '@/components/icons'
import type { ProjectStatus } from '@/engineering/types'

const statusStyles: Record<ProjectStatus, { label: string; className: string }> = {
  production: { label: 'Production', className: 'border-success/30 bg-success/10 text-success' },
  'active-development': { label: 'Active Development', className: 'border-brand/30 bg-brand/10 text-brand' },
  experimental: { label: 'Experimental', className: 'border-brand-alt/30 bg-brand-alt/10 text-brand-alt' },
  archived: { label: 'Archived', className: 'border-white/10 bg-white/5 text-fg-muted' },
}

export function EngineeringHeader({
  title,
  tagline,
  status,
  liveUrl,
  githubUrl,
  projectHref,
}: {
  title: string
  tagline: string
  status?: ProjectStatus
  liveUrl: string | null
  githubUrl: string | null
  projectHref: string
}) {
  const statusStyle = status ? statusStyles[status] : null

  return (
    <header className="animate-fade-up">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="font-mono text-xs text-brand">// engineering view</p>
        {statusStyle && (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs ${statusStyle.className}`}>
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            <span className="sr-only">Status: </span>
            {statusStyle.label}
          </span>
        )}
      </div>
      <h1 className="text-gradient font-display text-[clamp(2.2rem,6vw,3.5rem)] leading-tight font-bold">{title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-fg-muted sm:text-lg">{tagline}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {liveUrl && (
          <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={smallPrimaryButton}>
            <ExternalLinkIcon />
            Live Project
          </a>
        )}
        {githubUrl && (
          <a href={githubUrl} target="_blank" rel="noopener noreferrer" className={smallSecondaryButton}>
            <GithubIcon size={14} />
            GitHub Repository
          </a>
        )}
        <Link to={projectHref} className="px-2 py-2 text-sm text-fg-muted transition-colors hover:text-white">
          ← Back to Project
        </Link>
      </div>
    </header>
  )
}
