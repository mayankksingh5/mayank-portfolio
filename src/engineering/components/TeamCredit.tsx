import type { TeamCredit as TeamCreditData } from '@/engineering/types'

/** "Team project" note with the owner's own contributions, shown in the overview. */
export function TeamCredit({ team }: { team: TeamCreditData }) {
  return (
    <div className="mt-6 grid gap-5 border-t border-white/6 pt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div>
        <h3 className="mb-2 font-mono text-xs text-brand-alt">Team project</h3>
        <p className="text-sm leading-relaxed text-fg-muted">{team.summary}</p>
      </div>
      <div>
        <h3 className="mb-2 font-mono text-xs text-brand-alt">My role</h3>
        <ul className="space-y-1.5">
          {team.myRole.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-fg">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
