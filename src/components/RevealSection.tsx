import type { ReactNode } from 'react'
import { useReveal } from '@/hooks/useReveal'

/** Page section that fades up the first time it scrolls into view. */
export function RevealSection({
  id,
  labelledBy,
  className = '',
  children,
}: {
  id?: string
  labelledBy?: string
  className?: string
  children: ReactNode
}) {
  const ref = useReveal<HTMLElement>()
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={`reveal relative z-10 scroll-mt-20 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6">{children}</div>
    </section>
  )
}
