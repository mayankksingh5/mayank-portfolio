import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/SectionHeading'
import type { Achievement } from '@/types/database'

export function AchievementsSection({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) return null

  return (
    <RevealSection id="achievements" labelledBy="achievements-heading" className="py-12">
      <SectionHeading id="achievements-heading" label="Recognition" title="Achievements" />

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {achievements.map((achievement) => {
          const content = (
            <>
              <span aria-hidden="true" className="text-2xl">
                {achievement.icon ?? '🏆'}
              </span>
              <span>
                <span className="block font-display text-sm font-semibold text-fg">{achievement.title}</span>
                {achievement.description && (
                  <span className="block text-xs text-fg-subtle">{achievement.description}</span>
                )}
              </span>
            </>
          )
          const className =
            'glass flex h-full items-center gap-4 rounded-xl border-white/7! p-5 transition-all duration-300 hover:-translate-y-1'
          return (
            <li key={achievement.id}>
              {achievement.url ? (
                <a href={achievement.url} target="_blank" rel="noopener noreferrer" className={className}>
                  {content}
                </a>
              ) : (
                <div className={className}>{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </RevealSection>
  )
}
