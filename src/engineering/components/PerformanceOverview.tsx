import { NoteGrid } from '@/engineering/components/layout'
import type { ProjectEngineering } from '@/engineering/types'

/** Measured metrics (only when recorded with a source) followed by optimization techniques. */
export function PerformanceOverview({ performance }: { performance: NonNullable<ProjectEngineering['performance']> }) {
  const metrics = performance.metrics ?? []
  const techniques = performance.techniques ?? []

  return (
    <div className="space-y-6">
      {metrics.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <li key={metric.label} className="glass rounded-2xl p-5">
              <p className="text-gradient-brand font-display text-3xl font-bold">{metric.value}</p>
              <p className="mt-1 text-sm font-medium text-fg">{metric.label}</p>
              <p className="mt-2 text-xs text-fg-subtle">
                {metric.source} · {metric.measuredAt}
              </p>
            </li>
          ))}
        </ul>
      )}
      {techniques.length > 0 && <NoteGrid notes={techniques} />}
    </div>
  )
}
