import { ExternalLinkIcon } from '@/components/icons'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/SectionHeading'
import { formatMonthYear } from '@/lib/format'
import { publicUrl } from '@/lib/storageUrl'
import type { Certification } from '@/types/database'

const ACCENTS = ['#06b6d4', '#f97316', '#8b5cf6', '#3b82f6', '#10b981']

export function CertificationsSection({ certifications }: { certifications: Certification[] }) {
  if (certifications.length === 0) return null

  return (
    <RevealSection id="certifications" labelledBy="certifications-heading" className="py-16">
      <SectionHeading id="certifications-heading" label="Learning" title="Certifications & Learning" />

      <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((certification, index) => {
          const color = ACCENTS[index % ACCENTS.length]
          return (
            <li
              key={certification.id}
              className="glass flex flex-col gap-4 rounded-xl border-white/7! p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                aria-hidden="true"
                className="flex size-12 items-center justify-center overflow-hidden rounded-xl text-2xl"
                style={{ background: `${color}26` }}
              >
                {certification.image_path ? (
                  <img
                    src={publicUrl('media', certification.image_path)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                ) : (
                  (certification.icon ?? '🎓')
                )}
              </div>
              <div>
                <h3 className="mb-1 font-display text-sm font-semibold text-fg">{certification.name}</h3>
                <p className="text-xs text-fg-subtle">
                  {certification.issuer}
                  {certification.issue_date && ` · ${formatMonthYear(certification.issue_date)}`}
                </p>
              </div>
              {certification.credential_url && (
                <a
                  href={certification.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors hover:bg-white/10"
                  style={{ color, border: `1px solid ${color}40` }}
                >
                  <ExternalLinkIcon size={12} /> View Credential
                  <span className="sr-only">: {certification.name}</span>
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </RevealSection>
  )
}
