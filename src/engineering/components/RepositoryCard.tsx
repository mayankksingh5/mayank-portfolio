import { smallSecondaryButton } from '@/components/buttonStyles'
import { GithubIcon } from '@/components/icons'
import { displayUrl } from '@/lib/format'
import type { ProjectEngineering } from '@/engineering/types'

export function RepositoryCard({ repository }: { repository: NonNullable<ProjectEngineering['repository']> }) {
  return (
    <div className="glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-fg">
          <GithubIcon size={20} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">{displayUrl(repository.url)}</p>
          <p className="mt-0.5 text-xs text-fg-subtle">
            Public repository{repository.language ? ` · ${repository.language}` : ''}
          </p>
        </div>
      </div>
      <a href={repository.url} target="_blank" rel="noopener noreferrer" className={`${smallSecondaryButton} shrink-0`}>
        <GithubIcon size={14} />
        View repository
      </a>
    </div>
  )
}
