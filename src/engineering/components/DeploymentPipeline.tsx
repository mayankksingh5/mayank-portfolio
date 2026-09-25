import { StepFlow } from '@/engineering/components/layout'
import type { ProjectEngineering } from '@/engineering/types'

export function DeploymentPipeline({ deployment }: { deployment: NonNullable<ProjectEngineering['deployment']> }) {
  return (
    <div className="glass space-y-6 rounded-2xl p-4 sm:p-6">
      <StepFlow steps={deployment.steps} label="Deployment pipeline" />

      {deployment.facts && deployment.facts.length > 0 && (
        <dl className="grid gap-4 border-t border-white/6 pt-6 sm:grid-cols-2 lg:grid-cols-5">
          {deployment.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="font-mono text-xs text-fg-subtle">{fact.label}</dt>
              <dd className="mt-1 text-sm text-fg">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {deployment.note && <p className="text-sm leading-relaxed text-fg-muted">{deployment.note}</p>}
    </div>
  )
}
