import { useReveal } from '@/hooks/useReveal'
import type { Stat } from '@/types/database'

export function Stats({ stats }: { stats: Stat[] }) {
  const ref = useReveal<HTMLElement>()
  if (stats.length === 0) return null

  return (
    <section ref={ref} aria-label="Highlights" className="reveal relative z-10">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <li
              key={stat.id}
              className="glass rounded-xl p-5 text-center transition-all duration-300 hover:-translate-y-1"
            >
              <p className="text-gradient-brand mb-1 font-display text-[1.8rem] font-bold">
                {stat.value}
                {stat.unit && <span className="ml-1 text-base">{stat.unit}</span>}
              </p>
              <p className="text-xs text-fg-subtle">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
