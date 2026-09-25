import { useId, useState } from 'react'
import { FlowArrow } from '@/engineering/components/layout'
import type { ArchitectureLayer, ArchitectureNode } from '@/engineering/types'

/**
 * Layered system diagram built from data. Layers run left to right on desktop
 * and stack on small screens; selecting a node explains what it does (inline
 * on small screens, in a panel under the diagram on desktop).
 */
export function ArchitectureDiagram({ layers }: { layers: ArchitectureLayer[] }) {
  const nodes = layers.flatMap((layer) => layer.nodes)
  const [selectedId, setSelectedId] = useState(nodes[0]?.id)
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0]
  const panelId = useId()

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <p className="mb-4 text-xs text-fg-subtle">Select a component to see what it does.</p>
      <ol aria-label="System architecture, in request order" className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {layers.map((layer, index) => (
          <li key={layer.label} className="flex flex-col gap-2 lg:flex-1 lg:flex-row lg:items-center">
            <div className="flex-1 rounded-xl border border-white/6 bg-white/2 p-3 lg:self-stretch">
              <p className="mb-2 font-mono text-xs text-fg-subtle">{layer.label}</p>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {layer.nodes.map((node) => {
                  const active = node.id === selected?.id
                  return (
                    <li key={node.id}>
                      <button
                        type="button"
                        aria-pressed={active}
                        aria-controls={panelId}
                        onClick={() => setSelectedId(node.id)}
                        className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 ${
                          active
                            ? 'border-brand/50 bg-brand/10'
                            : 'border-white/8 bg-white/4 hover:border-white/16 hover:bg-white/6'
                        }`}
                      >
                        <span className="block text-sm font-semibold text-fg">{node.label}</span>
                        {node.tech && <span className="mt-0.5 block text-xs text-fg-muted">{node.tech}</span>}
                      </button>
                      {active && (
                        <p aria-live="polite" className="mt-2 px-1 text-sm leading-relaxed text-fg-muted lg:hidden">
                          {node.description}
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
            {index < layers.length - 1 && <FlowArrow />}
          </li>
        ))}
      </ol>
      {selected && <NodeDetails id={panelId} node={selected} />}
    </div>
  )
}

function NodeDetails({ id, node }: { id: string; node: ArchitectureNode }) {
  return (
    <div id={id} aria-live="polite" className="mt-4 hidden rounded-xl border border-brand/20 bg-brand/5 p-4 lg:block">
      <p className="font-display text-base font-semibold text-fg">
        {node.label}
        {node.tech && <span className="ml-2 font-sans text-xs font-normal text-brand-alt">{node.tech}</span>}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-fg-muted">{node.description}</p>
    </div>
  )
}
