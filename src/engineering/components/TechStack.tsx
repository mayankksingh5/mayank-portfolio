import { Tag } from '@/components/Tag'
import type { TechCategory } from '@/engineering/types'

export function TechStack({ categories }: { categories: TechCategory[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((group) => (
        <li key={group.category} className="glass rounded-2xl p-5">
          <h3 className="mb-3 font-mono text-xs text-brand-alt">{group.category}</h3>
          <ul aria-label={group.category} className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li key={item}>
                <Tag>{item}</Tag>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
