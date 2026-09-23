import type { ReactNode } from 'react'

type Tone = 'brand' | 'neutral'

const toneClasses: Record<Tone, string> = {
  brand: 'border-brand/20 bg-brand/10 text-brand',
  neutral: 'border-white/8 bg-white/5 text-fg-muted',
}

export function Tag({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`rounded border px-2 py-1 text-xs ${toneClasses[tone]}`}>{children}</span>
}

export function TagList({ tags, tone }: { tags: string[]; tone?: Tone }) {
  if (tags.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Technologies">
      {tags.map((tag) => (
        <li key={tag}>
          <Tag tone={tone}>{tag}</Tag>
        </li>
      ))}
    </ul>
  )
}
