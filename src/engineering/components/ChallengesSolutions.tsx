import type { EngineeringChallenge } from '@/engineering/types'

/** Each challenge is collapsed to its title and problem; details open on demand. */
export function ChallengesSolutions({ challenges }: { challenges: EngineeringChallenge[] }) {
  return (
    <ul className="space-y-3">
      {challenges.map((item) => {
        const rows = [
          { term: 'Approach', value: item.approach },
          { term: 'Solution', value: item.solution },
          { term: 'Impact', value: item.impact },
        ].filter((row): row is { term: string; value: string } => Boolean(row.value))

        return (
          <li key={item.title}>
            <details className="group glass rounded-2xl">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-2xl p-5 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block font-display text-lg font-semibold text-fg">{item.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-fg-muted">{item.challenge}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 font-mono text-lg text-brand transition-transform duration-200 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <dl className="grid gap-4 border-t border-white/6 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => (
                  <div key={row.term}>
                    <dt className="mb-1 font-mono text-xs text-brand-alt">{row.term}</dt>
                    <dd className="text-sm leading-relaxed text-fg-muted">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </li>
        )
      })}
    </ul>
  )
}
