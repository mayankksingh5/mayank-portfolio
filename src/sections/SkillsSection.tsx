import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/SectionHeading'
import type { SkillGroup } from '@/services/portfolio'

/** Category dot colours from the design, reused in order. */
const ACCENTS = ['#3b82f6', '#f97316', '#06b6d4', '#8b5cf6', '#10b981']

/** Icons from the design for well-known skills; unknown skills show no icon. */
const SKILL_ICONS: Record<string, string> = {
  docker: '🐳',
  kubernetes: '☸️',
  jenkins: '🔧',
  'github actions': '⚡',
  git: '📦',
  linux: '🐧',
  aws: '☁️',
  'google cloud': '🌐',
  'google cloud platform': '🌐',
  gcp: '🌐',
  java: '☕',
  javascript: '🟨',
  c: '⚙️',
  sql: '🗄️',
  html: '🌐',
  css: '🎨',
  'mern stack': '⚛️',
  react: '⚛️',
  github: '🐙',
  'vs code': '💙',
  figma: '🎭',
  dialogflow: '💬',
  python: '🐍',
  typescript: '🔷',
}

export function SkillsSection({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) return null

  return (
    <RevealSection id="skills" labelledBy="skills-heading" className="py-20">
      <SectionHeading id="skills-heading" label="Technologies" title="Tech Stack" />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ category, skills }, index) => (
          <article
            key={category.id}
            className="glass rounded-xl border-white/7! p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="mb-4 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ background: ACCENTS[index % ACCENTS.length] }}
              />
              <h3 className="font-display text-sm font-semibold text-fg">{category.name}</h3>
            </div>
            <ul className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const icon = SKILL_ICONS[skill.name.trim().toLowerCase()]
                return (
                  <li
                    key={skill.id}
                    className="flex cursor-default items-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-3 py-1.5 text-xs font-medium text-fg-muted transition-all duration-200 hover:scale-105"
                  >
                    {icon && <span aria-hidden="true">{icon}</span>}
                    <span>{skill.name}</span>
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </div>
    </RevealSection>
  )
}
