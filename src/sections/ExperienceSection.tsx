import { CheckIcon, MapPinIcon } from '@/components/icons'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/SectionHeading'
import { formatDateRange } from '@/lib/format'
import type { Experience } from '@/types/database'

type DotTone = 'blue' | 'cyan' | 'gray'

const dotBorder: Record<DotTone, string> = {
  blue: 'border-brand',
  cyan: 'border-brand-alt',
  gray: 'border-fg-dim',
}

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  if (experiences.length === 0) return null

  return (
    <RevealSection id="experience" labelledBy="experience-heading" className="py-20">
      <SectionHeading id="experience-heading" label="Work History" title="Experience" />

      <div className="relative mt-12">
        <div
          aria-hidden="true"
          className="absolute top-4 bottom-4 left-5 hidden w-px bg-linear-to-b from-brand to-brand/10 sm:block"
        />
        <ol className="space-y-10">
          {experiences.map((experience, index) => {
            // A newer role at the same company right above means this one led to a promotion.
            const newer = experiences[index - 1]
            const promotedTo =
              newer && newer.company.trim().toLowerCase() === experience.company.trim().toLowerCase()
                ? newer.role
                : null
            const tone: DotTone = experience.is_current ? 'blue' : index === 1 ? 'cyan' : 'gray'
            return (
              <TimelineItem
                key={experience.id}
                experience={experience}
                tone={tone}
                promotedTo={promotedTo}
              />
            )
          })}
        </ol>
      </div>
    </RevealSection>
  )
}

function TimelineItem({
  experience,
  tone,
  promotedTo,
}: {
  experience: Experience
  tone: DotTone
  promotedTo: string | null
}) {
  const bullets = experience.description
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
  const current = experience.is_current

  return (
    <li className="relative flex gap-6 sm:pl-14">
      <span
        aria-hidden="true"
        className={`absolute top-6 left-[0.6rem] hidden size-5 items-center justify-center rounded-full border-2 sm:flex ${dotBorder[tone]} ${
          current ? 'bg-brand' : 'bg-panel'
        }`}
      >
        {current && <span className="size-2 rounded-full bg-white" />}
      </span>

      <article
        className={`glass w-full rounded-xl p-6 transition-all duration-300 hover:-translate-y-0.5 ${
          current ? 'border-brand/25!' : ''
        }`}
      >
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-semibold text-fg">{experience.role}</h3>
              {current && (
                <span className="rounded bg-success/15 px-2 py-0.5 text-xs text-success">Current Role</span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-brand">
              {experience.company_url ? (
                <a
                  href={experience.company_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {experience.company}
                </a>
              ) : (
                experience.company
              )}
            </p>
            {experience.location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-fg-subtle">
                <MapPinIcon /> {experience.location}
              </p>
            )}
          </div>
          <p className="shrink-0 rounded-lg bg-white/5 px-3 py-1 font-mono text-xs text-fg-muted">
            {formatDateRange(experience.start_date, experience.end_date, current, ' — ')}
          </p>
        </div>

        {promotedTo && (
          <p className="mb-4 flex items-center gap-2 rounded-lg border border-brand-alt/20 bg-brand-alt/8 px-3 py-2 text-xs text-brand-alt">
            ↑ Promoted to {promotedTo}
          </p>
        )}

        {bullets.length > 0 && (
          <ul className="mb-4 space-y-1.5">
            {bullets.map((bullet, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-fg-muted">
                <span className="mt-1 shrink-0 text-blue-500">
                  <CheckIcon size={12} />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {experience.technologies.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Technologies">
            {experience.technologies.map((tech) => (
              <li
                key={tech}
                className="rounded border border-brand/20 bg-brand/10 px-2 py-0.5 text-xs text-brand"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
      </article>
    </li>
  )
}
