import { externalLinkProps, primaryButton, secondaryButton } from '@/components/buttonStyles'
import { DownloadIcon, SocialIcon } from '@/components/icons'
import { useTypingAnimation } from '@/hooks/useTypingAnimation'
import type { SocialLink } from '@/types/database'

const TERMINAL_STATUS = [
  'CI/CD pipelines  ✓  running',
  'Docker containers ✓  healthy',
  'K8s cluster      ✓  active',
  'AWS infra        ✓  scaled',
]

function Prompt({ command }: { command?: string }) {
  return (
    <>
      <span className="text-brand-alt">mayank@portfolio</span>
      <span className="text-fg-subtle">:~$</span>
      {command && <span className="ml-2 text-fg">{command}</span>}
    </>
  )
}

/** Decorative terminal card. `compact` is the smaller version overlapping the photo. */
function Terminal({
  currentRole,
  stack,
  compact = false,
}: {
  currentRole: string
  stack: string[]
  compact?: boolean
}) {
  return (
    <div className="animate-pulse-glow overflow-hidden rounded-2xl border border-white/10 bg-panel/90 font-mono backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-white/6 bg-white/3 px-4 py-3">
        <span className="size-3 rounded-full bg-red-500/70" />
        <span className="size-3 rounded-full bg-yellow-500/70" />
        <span className="size-3 rounded-full bg-green-500/70" />
        <span className="ml-4 text-xs text-fg-faint">mayank@portfolio ~ zsh</span>
      </div>

      <div className={compact ? 'space-y-3 p-4 text-xs' : 'space-y-4 p-6 text-sm'}>
        {currentRole && (
          <div>
            <Prompt command="whoami" />
            <div className="mt-1 text-fg-muted">{currentRole}</div>
          </div>
        )}
        {stack.length > 0 && (
          <div>
            <Prompt command="stack --current" />
            <div className="mt-1 text-brand">{stack.join(' • ')}</div>
          </div>
        )}
        {!compact && (
          <div>
            <Prompt command="status --current" />
            <div className="mt-2 space-y-1">
              {TERMINAL_STATUS.map((line) => (
                <div key={line} className="text-[0.8rem] text-success">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center">
          <Prompt />
          <span className="ml-2 inline-block h-4 w-2 animate-blink bg-brand" />
        </div>
      </div>
    </div>
  )
}

export function Hero({
  name,
  roles,
  summary,
  openToWork,
  socialLinks,
  resumeUrl,
  currentRole,
  stack,
  photoUrl,
}: {
  name: string
  roles: string[]
  summary: string
  openToWork: boolean
  socialLinks: SocialLink[]
  resumeUrl: string | null
  currentRole: string
  stack: string[]
  photoUrl: string | null
}) {
  const typed = useTypingAnimation(roles)

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative flex min-h-dvh items-center overflow-hidden pt-20 pb-16"
    >
      {/* Background glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-25 -right-25 size-150 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.12)_0%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 -left-20 size-100 rounded-full bg-[radial-gradient(circle,rgb(6_182_212/0.08)_0%,transparent_70%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="animate-fade-up">
            {/* Mobile/tablet photo (the large frame is desktop-only) */}
            {photoUrl && (
              <div className="relative mb-8 w-fit lg:hidden">
                <div aria-hidden="true" className="absolute -inset-2 rounded-3xl bg-brand-gradient opacity-30 blur-xl" />
                <div className="relative rounded-3xl bg-brand-gradient p-0.5">
                  <img
                    src={photoUrl}
                    alt={name}
                    width={128}
                    height={160}
                    fetchPriority="high"
                    className="h-40 w-32 rounded-[1.4rem] object-cover"
                  />
                </div>
              </div>
            )}

            {openToWork && (
              <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-alt/25 bg-brand-alt/12 px-3 py-1.5 text-xs font-medium text-brand-alt">
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-emerald-400" />
                Open to Opportunities
              </p>
            )}

            <p className="mb-3 font-mono text-sm text-fg-subtle">Hello, I&apos;m</p>
            <h1
              id="hero-heading"
              className="text-gradient mb-4 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.1] pb-[0.15em] font-bold tracking-tight"
            >
              {name}
            </h1>

            {roles.length > 0 && (
              <p className="mb-6 flex h-8 items-center gap-2">
                {/* Screen readers get the full list instead of the animation. */}
                <span className="sr-only">{roles.join(', ')}</span>
                <span aria-hidden="true" className="font-mono text-base font-medium text-brand">
                  {typed}
                </span>
                <span aria-hidden="true" className="h-5 w-0.5 animate-blink bg-blue-400" />
              </p>
            )}

            {summary && <p className="mb-8 max-w-lg text-base leading-relaxed text-fg-muted">{summary}</p>}

            <div className="mb-10 flex flex-wrap gap-4">
              <a href="#projects" className={primaryButton}>
                View My Work
              </a>
              {resumeUrl && (
                <a href={resumeUrl} className={secondaryButton}>
                  <DownloadIcon />
                  Download Resume
                </a>
              )}
            </div>

            {socialLinks.length > 0 && (
              <ul className="flex items-center gap-4">
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      aria-label={link.label}
                      {...externalLinkProps(link.url)}
                      className="flex size-10 items-center justify-center rounded-lg border border-white/8 bg-white/5 text-fg-subtle transition-all duration-200 hover:-translate-y-0.5 hover:text-white"
                    >
                      <SocialIcon platform={link.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {photoUrl ? (
            /* Large portrait with the terminal overlapping its lower-left corner */
            <div className="hidden justify-center lg:flex">
              <div className="relative w-full max-w-sm animate-float">
                <div
                  aria-hidden="true"
                  className="absolute -inset-6 rounded-[2.5rem] bg-brand-gradient opacity-25 blur-3xl"
                />
                <div className="relative rounded-[2rem] bg-linear-to-br from-brand via-brand-alt/60 to-white/10 p-0.5 shadow-2xl shadow-black/50">
                  <img
                    src={photoUrl}
                    alt={name}
                    width={384}
                    height={480}
                    fetchPriority="high"
                    className="aspect-4/5 w-full rounded-[1.9rem] object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0.5 rounded-[1.9rem] bg-linear-to-t from-ink/60 via-transparent to-transparent"
                  />
                </div>
                <div aria-hidden="true" className="absolute -bottom-10 -left-24 w-72">
                  <Terminal currentRole={currentRole} stack={stack} compact />
                </div>
              </div>
            </div>
          ) : (
            /* Terminal visual (decorative) */
            <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
              <div className="w-full max-w-md animate-float">
                <Terminal currentRole={currentRole} stack={stack} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
