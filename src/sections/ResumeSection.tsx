import { primaryButton, secondaryButton } from '@/components/buttonStyles'
import { DownloadIcon, ExternalLinkIcon } from '@/components/icons'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/SectionHeading'

const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })

export function ResumeSection({
  name,
  downloadUrl,
  viewUrl,
  fileName,
  updatedAt,
  highlights,
}: {
  name: string
  downloadUrl: string | null
  viewUrl: string | null
  fileName: string | null
  updatedAt: string | null
  highlights: string[]
}) {
  if (!downloadUrl || !viewUrl) return null

  return (
    <RevealSection id="resume" labelledBy="resume-heading" className="py-16">
      <SectionHeading id="resume-heading" label="Curriculum Vitae" title="Resume" />

      <div className="glass group relative mt-12 overflow-hidden rounded-2xl border-brand/20! p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.16)_0%,transparent_70%)] transition-opacity duration-500 group-hover:opacity-100 sm:opacity-70"
        />

        <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-center">
          {/* Decorative document preview */}
          <div
            aria-hidden="true"
            className="relative w-32 shrink-0 rotate-[-4deg] transition-transform duration-500 group-hover:rotate-0 sm:w-36"
          >
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-lg border border-white/8 bg-white/3" />
            <div className="relative aspect-[1/1.3] rounded-lg border border-white/12 bg-panel p-3 shadow-xl shadow-black/40">
              <div className="mb-2 h-2 w-3/5 rounded-full bg-brand-gradient" />
              <div className="mb-3 h-1.5 w-2/5 rounded-full bg-white/15" />
              {[90, 75, 85, 60].map((width, index) => (
                <div key={index} className="mb-1.5 h-1 rounded-full bg-white/10" style={{ width: `${width}%` }} />
              ))}
              <div className="mt-3 mb-1.5 h-1.5 w-1/3 rounded-full bg-brand-alt/40" />
              {[80, 70, 88].map((width, index) => (
                <div key={index} className="mb-1.5 h-1 rounded-full bg-white/10" style={{ width: `${width}%` }} />
              ))}
              <span className="absolute right-2 bottom-2 rounded bg-red-500/80 px-1.5 py-0.5 font-mono text-[0.55rem] font-bold text-white">
                PDF
              </span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-xl font-bold text-fg">{name} — Resume</h3>
            <p className="mt-1 font-mono text-xs text-fg-subtle">
              {fileName ?? 'resume.pdf'}
              {updatedAt && ` · Updated ${monthYear.format(new Date(updatedAt))}`}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-fg-muted">
              A one-page summary of my experience, projects, skills and education. Download it or open it in
              your browser.
            </p>
            {highlights.length > 0 && (
              <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start" aria-label="Highlights">
                {highlights.map((item) => (
                  <li
                    key={item}
                    className="rounded border border-brand/20 bg-brand/10 px-2 py-0.5 text-xs text-brand"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
              <a href={downloadUrl} className={primaryButton}>
                <DownloadIcon /> Download Resume
              </a>
              <a href={viewUrl} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                <ExternalLinkIcon /> View in Browser
              </a>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  )
}
