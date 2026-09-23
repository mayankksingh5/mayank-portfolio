import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/SectionHeading'
import { publicUrl } from '@/lib/storageUrl'
import type { Profile } from '@/types/database'

export function About({
  profile,
  focusAreas,
  facts,
}: {
  profile: Profile
  focusAreas: string[]
  facts: { label: string; value: string }[]
}) {
  const paragraphs = profile.about
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <RevealSection id="about" labelledBy="about-heading" className="py-20">
      <SectionHeading id="about-heading" label="Who I Am" title="About Me" />
      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className={`leading-relaxed text-fg-muted ${index === paragraphs.length - 1 ? 'mb-8' : 'mb-6'}`}
            >
              {paragraph}
            </p>
          ))}
          {focusAreas.length > 0 && (
            <ul className="flex flex-wrap gap-3">
              {focusAreas.map((area) => (
                <li
                  key={area}
                  className="rounded-lg border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-medium text-brand"
                >
                  {area}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-6 flex items-center gap-4">
            {profile.avatar_path && (
              <img
                src={publicUrl('media', profile.avatar_path)}
                alt={profile.full_name}
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
                className="size-16 rounded-full border border-white/10 object-cover"
              />
            )}
            {profile.is_open_to_work && (
              <p className="flex w-fit items-center gap-2 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-xs text-success">
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-emerald-400" />
                Available for opportunities
              </p>
            )}
          </div>

          {facts.length > 0 && (
            <dl className="space-y-4">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-start justify-between gap-4 border-b border-white/6 py-3">
                  <dt className="text-sm text-fg-subtle">{fact.label}</dt>
                  <dd className="max-w-56 text-right text-sm font-medium text-fg">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {profile.interests.length > 0 && (
            <div className="mt-6 border-t border-white/6 pt-4">
              <p className="mb-3 text-xs text-fg-subtle">Interests</p>
              <ul className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <li key={interest} className="rounded bg-white/5 px-2 py-1 text-xs text-fg-muted">
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </RevealSection>
  )
}
