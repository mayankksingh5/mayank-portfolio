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

export function Hero({
  name,
  roles,
  summary,
  openToWork,
  socialLinks,
  resumeUrl,
  currentRole,
  stack,
}: {
  name: string
  roles: string[]
  summary: string
  openToWork: boolean
  socialLinks: SocialLink[]
  resumeUrl: string | null
  currentRole: string
  stack: string[]
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
            {openToWork && (
              <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-alt/25 bg-brand-alt/12 px-3 py-1.5 text-xs font-medium text-brand-alt">
                <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-emerald-400" />
                Open to Opportunities
              </p>
            )}

            <p className="mb-3 font-mono text-sm text-fg-subtle">Hello, I&apos;m</p>
            <h1
              id="hero-heading"
              className="text-gradient mb-4 font-display text-[clamp(2.4rem,5vw,4rem)] leading-none font-bold tracking-tight"
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

          {/* Terminal visual (decorative) */}
          <div className="hidden items-center justify-center lg:flex" aria-hidden="true">
            <div className="w-full max-w-md animate-float">
              <div className="animate-pulse-glow overflow-hidden rounded-2xl border border-white/10 bg-panel/90 font-mono">
                <div className="flex items-center gap-2 border-b border-white/6 bg-white/3 px-4 py-3">
                  <span className="size-3 rounded-full bg-red-500/70" />
                  <span className="size-3 rounded-full bg-yellow-500/70" />
                  <span className="size-3 rounded-full bg-green-500/70" />
                  <span className="ml-4 text-xs text-fg-faint">mayank@portfolio ~ zsh</span>
                </div>

                <div className="space-y-4 p-6 text-sm">
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
                  <div className="flex items-center">
                    <Prompt />
                    <span className="ml-2 inline-block h-4 w-2 animate-blink bg-brand" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
