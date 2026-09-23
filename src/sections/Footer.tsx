import { SocialIcon } from '@/components/icons'
import type { SocialLink } from '@/types/database'
import type { NavLink } from '@/sections/Navbar'

export function Footer({
  name,
  tagline,
  links,
  socialLinks,
}: {
  name: string
  tagline: string
  links: NavLink[]
  socialLinks: SocialLink[]
}) {
  const socials = socialLinks.filter((link) => link.platform !== 'email')

  return (
    <footer className="relative z-10 border-t border-white/6 bg-panel/50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="mb-1 font-display text-sm font-bold text-fg">{name}</p>
            {tagline && <p className="text-xs text-fg-subtle">{tagline}</p>}
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-5">
              {links.map((link) => (
                <li key={link.id}>
                  <a href={`#${link.id}`} className="text-xs text-fg-subtle transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {socials.length > 0 && (
            <ul className="flex gap-4">
              {socials.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="text-fg-subtle transition-colors hover:text-white"
                  >
                    <SocialIcon platform={link.platform} size={16} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-fg-subtle">
          Designed &amp; Built by {name}
        </p>
      </div>
    </footer>
  )
}
