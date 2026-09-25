import type { ProjectEngineering } from '@/engineering/types'

export function EngineeringTimeline({ timeline }: { timeline: NonNullable<ProjectEngineering['timeline']> }) {
  return (
    <div>
      <ol className="relative space-y-6 border-l border-white/10 pl-6">
        {timeline.milestones.map((milestone) => (
          <li key={milestone.title} className="relative">
            <span
              aria-hidden="true"
              className="absolute top-1.5 -left-[29px] size-2.5 rounded-full border-2 border-ink bg-brand"
            />
            {milestone.date && <p className="mb-0.5 font-mono text-xs text-fg-subtle">{milestone.date}</p>}
            <h3 className="text-sm font-semibold text-fg">{milestone.title}</h3>
            {milestone.description && <p className="mt-1 text-sm text-fg-muted">{milestone.description}</p>}
          </li>
        ))}
      </ol>
      {timeline.source && <p className="mt-6 text-xs text-fg-subtle">{timeline.source}</p>}
    </div>
  )
}
