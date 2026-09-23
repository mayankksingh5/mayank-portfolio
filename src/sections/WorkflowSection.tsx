import { Fragment } from 'react'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/SectionHeading'

/** Static DevOps pipeline from the design. */
const STEPS = [
  { step: 'CODE', tool: 'Git', color: '#3b82f6' },
  { step: 'BUILD', tool: 'GitHub Actions / Jenkins', color: '#06b6d4' },
  { step: 'TEST', tool: 'Docker', color: '#8b5cf6' },
  { step: 'DEPLOY', tool: 'Kubernetes', color: '#10b981' },
  { step: 'MONITOR', tool: 'AWS', color: '#f59e0b' },
]

export function WorkflowSection() {
  return (
    <RevealSection labelledBy="workflow-heading" className="py-16">
      <SectionHeading id="workflow-heading" label="Process" title="How I Work" />

      <div className="glass mt-12 rounded-2xl p-8">
        <ol className="flex flex-wrap items-center justify-center">
          {STEPS.map(({ step, tool, color }, index) => (
            <Fragment key={step}>
              <li className="flex flex-col items-center gap-2 px-4 py-3">
                <span
                  aria-hidden="true"
                  className="flex size-14 cursor-default items-center justify-center rounded-xl font-mono text-xs font-bold transition-all duration-200 hover:scale-110"
                  style={{ background: `${color}26`, border: `1px solid ${color}40`, color }}
                >
                  {step.slice(0, 2)}
                </span>
                <span className="font-display text-xs font-semibold" style={{ color }}>
                  {step}
                </span>
                <span className="text-center font-mono text-[0.65rem] text-fg-subtle">{tool}</span>
              </li>
              {index < STEPS.length - 1 && (
                <li aria-hidden="true" className="mx-1 flex items-center pb-8">
                  <span className="h-px w-8 bg-linear-to-r from-brand/50 to-brand-alt/50" />
                  <span className="text-[0.7rem] text-brand">▶</span>
                </li>
              )}
            </Fragment>
          ))}
        </ol>
      </div>
    </RevealSection>
  )
}
