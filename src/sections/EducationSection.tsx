import { MapPinIcon } from '@/components/icons'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/SectionHeading'
import { formatYearRange } from '@/lib/format'
import type { Education } from '@/types/database'

export function EducationSection({ education }: { education: Education[] }) {
  if (education.length === 0) return null

  return (
    <RevealSection id="education" labelledBy="education-heading" className="py-20">
      <SectionHeading id="education-heading" label="Academic Background" title="Education" />

      <div className="relative mt-12 max-w-2xl">
        <div
          aria-hidden="true"
          className="absolute top-4 bottom-4 left-5 hidden w-px bg-linear-to-b from-brand to-brand/10 sm:block"
        />
        <ol className="space-y-8">
          {education.map((item, index) => {
            const featured = index === 0
            const years = formatYearRange(item.start_date, item.end_date)
            const title = item.field_of_study ? `${item.degree} — ${item.field_of_study}` : item.degree
            return (
              <li key={item.id} className="relative flex gap-6 sm:pl-14">
                <span
                  aria-hidden="true"
                  className={`absolute top-5 left-3.5 hidden size-3 rounded-full border-2 sm:block ${
                    featured ? 'border-brand bg-brand' : 'border-fg-dim bg-panel'
                  }`}
                />
                <article
                  className={`glass w-full rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5 ${
                    featured ? 'border-brand/30!' : 'border-white/7!'
                  }`}
                >
                  <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                    <h3 className={`font-display font-semibold text-fg ${featured ? 'text-base' : 'text-sm'}`}>
                      {title}
                    </h3>
                    {years && (
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          featured ? 'bg-brand/15 text-brand' : 'bg-white/5 text-fg-subtle'
                        }`}
                      >
                        {years}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-fg-muted">{item.institution}</p>
                  {item.location && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-fg-subtle">
                      <MapPinIcon /> {item.location}
                    </p>
                  )}
                  {item.grade && <p className="mt-1 text-xs text-fg-subtle">Grade: {item.grade}</p>}
                  {item.description && (
                    <p className="mt-2 text-sm whitespace-pre-line text-fg-muted">{item.description}</p>
                  )}
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </RevealSection>
  )
}
