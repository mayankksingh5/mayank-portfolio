import { StepFlow } from '@/engineering/components/layout'
import type { DataFlow } from '@/engineering/types'

export function DataFlows({ flows }: { flows: DataFlow[] }) {
  return (
    <div className="space-y-4">
      {flows.map((flow) => (
        <div key={flow.title} className="glass rounded-2xl p-4 sm:p-6">
          <h3 className="mb-4 font-display text-base font-semibold text-fg">{flow.title}</h3>
          <StepFlow steps={flow.steps} label={flow.title} />
        </div>
      ))}
    </div>
  )
}
