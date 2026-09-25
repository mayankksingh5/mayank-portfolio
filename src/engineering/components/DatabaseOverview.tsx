import { Tag } from '@/components/Tag'
import type { DatabaseOverview as DatabaseOverviewData } from '@/engineering/types'

/** Conceptual data model: entities as cards, relationships as a short list. */
export function DatabaseOverview({ database }: { database: DatabaseOverviewData }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-fg">
          <span className="font-mono text-xs text-fg-subtle">Engine </span>
          {database.engine}
        </p>
        {database.summary && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted">{database.summary}</p>}
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {database.entities.map((entity) => (
          <li key={entity.name} className="glass flex flex-col rounded-2xl p-5">
            <h3 className="font-display text-base font-semibold text-fg">{entity.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">{entity.description}</p>
            {entity.access && (
              <p className="mt-4">
                <Tag tone="brand">{entity.access}</Tag>
              </p>
            )}
          </li>
        ))}
      </ul>

      {database.relationships && database.relationships.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 font-mono text-xs text-brand-alt">Relationships</h3>
          <ul className="space-y-2">
            {database.relationships.map((relation) => (
              <li
                key={`${relation.from}-${relation.to}`}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
              >
                <span className="font-semibold text-fg">{relation.from}</span>
                <span aria-hidden="true" className="text-fg-faint">
                  ⟷
                </span>
                <span className="sr-only">to</span>
                <span className="font-semibold text-fg">{relation.to}</span>
                <span className="text-fg-muted">· {relation.kind}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
