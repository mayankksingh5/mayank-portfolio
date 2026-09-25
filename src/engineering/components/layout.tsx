import type { ReactNode } from 'react'
import { SectionHeading } from '@/components/SectionHeading'
import { TagList } from '@/components/Tag'
import type { EngineeringNote, FlowStep } from '@/engineering/types'
import { useReveal } from '@/hooks/useReveal'

/** Engineering View section with the site's `// label` heading and fade-up reveal. */
export function EngineeringSection({
  id,
  label,
  title,
  children,
}: {
  id: string
  label: string
  title: string
  children: ReactNode
}) {
  const ref = useReveal<HTMLElement>()
  return (
    <section ref={ref} id={id} aria-labelledby={`${id}-heading`} className="reveal scroll-mt-24">
      <SectionHeading id={`${id}-heading`} label={label} title={title} />
      <div className="mt-8">{children}</div>
    </section>
  )
}

/** Arrow between diagram steps: down when stacked, right on wide screens. */
export function FlowArrow() {
  return (
    <span aria-hidden="true" className="self-center text-sm text-fg-faint">
      <span className="lg:hidden">↓</span>
      <span className="hidden lg:inline">→</span>
    </span>
  )
}

/** Numbered steps that run left to right on desktop and top to bottom on small screens. */
export function StepFlow({ steps, label }: { steps: FlowStep[]; label: string }) {
  return (
    <ol aria-label={label} className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      {steps.map((step, index) => (
        <li key={step.label} className="flex flex-col gap-2 lg:flex-1 lg:flex-row lg:items-center">
          <div className="flex-1 rounded-xl border border-white/8 bg-white/3 px-4 py-3 lg:self-stretch">
            <p className="font-mono text-xs text-brand">{String(index + 1).padStart(2, '0')}</p>
            <p className="mt-0.5 text-sm font-semibold text-fg">{step.label}</p>
            {step.detail && <p className="mt-1 text-xs leading-relaxed text-fg-muted">{step.detail}</p>}
          </div>
          {index < steps.length - 1 && <FlowArrow />}
        </li>
      ))}
    </ol>
  )
}

/** Grid of short engineering notes (features, techniques, security measures). */
export function NoteGrid({ notes }: { notes: EngineeringNote[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <li key={note.name} className="glass flex flex-col rounded-2xl p-5">
          <h3 className="font-display text-base font-semibold text-fg">{note.name}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">{note.description}</p>
          {note.tech && note.tech.length > 0 && (
            <div className="mt-4">
              <TagList tags={note.tech} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
