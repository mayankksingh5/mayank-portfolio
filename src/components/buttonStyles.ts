/** Shared button looks from the design (used on <a> and <button>). */

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-95'

export const primaryButton = `${base} bg-brand-gradient px-6 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:opacity-90`

export const secondaryButton = `${base} border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-fg hover:-translate-y-0.5 hover:bg-white/10`

export const smallPrimaryButton = `${base} bg-brand-gradient px-4 py-2 text-sm text-white hover:opacity-90`

export const smallSecondaryButton = `${base} border border-white/8 bg-white/5 px-4 py-2 text-sm text-fg hover:bg-white/10`

/** Props for links that open outside the site. */
export function externalLinkProps(url: string) {
  return url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener noreferrer' }
}
