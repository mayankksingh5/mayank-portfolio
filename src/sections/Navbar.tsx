import { useState } from 'react'
import { smallPrimaryButton } from '@/components/buttonStyles'
import { CloseIcon, DownloadIcon, MenuIcon, SocialIcon } from '@/components/icons'
import { useScrolled } from '@/hooks/useScrolled'
import type { SocialLink } from '@/types/database'

export type NavLink = { id: string; label: string }

export function Navbar({
  initials,
  shortName,
  links,
  activeId,
  socialLinks,
  resumeUrl,
}: {
  initials: string
  shortName: string
  links: NavLink[]
  activeId: string
  socialLinks: SocialLink[]
  resumeUrl: string | null
}) {
  const scrolled = useScrolled()
  const [menuOpen, setMenuOpen] = useState(false)
  // Design order: GitHub, then LinkedIn.
  const navSocials = ['github', 'linkedin']
    .map((platform) => socialLinks.find((link) => link.platform === platform))
    .filter((link): link is SocialLink => Boolean(link))

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'border-b border-white/6 bg-ink/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#home" className="group flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-lg bg-brand-gradient font-display text-sm font-bold text-white transition-transform duration-200 group-hover:scale-105"
          >
            {initials}
          </span>
          <span className="hidden font-display font-semibold text-white sm:block">{shortName}</span>
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = activeId === link.id
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={active ? 'location' : undefined}
                  className={`rounded-lg px-4 py-2 text-sm transition-all duration-200 hover:text-white ${
                    active ? 'bg-brand/10 text-brand' : 'text-fg-muted'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            )
          })}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {navSocials.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-fg-subtle transition-colors duration-200 hover:text-white"
            >
              <SocialIcon platform={link.platform} size={18} />
            </a>
          ))}
          {resumeUrl && (
            <a href={resumeUrl} className={smallPrimaryButton}>
              <DownloadIcon />
              Resume
            </a>
          )}
        </div>

        <button
          type="button"
          className="text-fg-muted hover:text-white lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="space-y-1 border-t border-white/8 bg-ink/97 px-6 py-4 backdrop-blur-xl lg:hidden">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          {navSocials.length > 0 && (
            <div className="flex gap-3 pt-3">
              {navSocials.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="p-1 text-fg-subtle hover:text-white"
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          )}
          {resumeUrl && (
            <a href={resumeUrl} className={`${smallPrimaryButton} mt-2 w-full`}>
              <DownloadIcon />
              Download Resume
            </a>
          )}
        </div>
      )}
    </header>
  )
}
