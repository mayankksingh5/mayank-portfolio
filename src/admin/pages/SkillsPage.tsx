import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { z } from 'zod'
import { CollectionManager, type CollectionConfig } from '@/admin/collection/CollectionManager'
import { Button } from '@/admin/components/Button'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { LoadError } from '@/admin/components/LoadError'
import { PageHeader } from '@/admin/components/PageHeader'
import { SectionSpinner } from '@/admin/components/Spinner'
import { requiredText } from '@/admin/forms/validation'
import { useToast } from '@/admin/toast/useToast'
import { getErrorMessage, getSaveErrorMessage } from '@/lib/errors'
import { addSkill, listSkills, removeSkill, skillCategoriesService } from '@/services/skills'
import type { Skill, SkillCategory } from '@/types/database'

const categoryConfig: CollectionConfig<SkillCategory> = {
  itemName: 'category',
  service: skillCategoriesService,
  fields: [
    { name: 'name', label: 'Category name', type: 'text', required: true, placeholder: 'e.g. Frontend' },
    { name: 'is_published', label: 'Show on portfolio', type: 'checkbox' },
  ],
  schema: z.object({ name: requiredText('Category name'), is_published: z.boolean() }),
  emptyValues: { name: '', is_published: true },
  toValues: (row) => ({ name: row.name, is_published: row.is_published }),
  summarize: (row) => ({ title: row.name }),
  emptyMessage: 'No categories yet. Add one (e.g. Languages, Frontend, Tools), then add skills to it.',
  deleteWarning: 'All skills in this category will be deleted too.',
}

export default function SkillsPage() {
  const [categories, setCategories] = useState<SkillCategory[]>([])

  return (
    <>
      <PageHeader title="Skills" description="Group your skills into categories." />
      <div className="flex flex-col gap-10">
        <section aria-labelledby="skill-categories-heading" className="flex flex-col gap-3">
          <h2 id="skill-categories-heading" className="text-lg font-semibold text-slate-900">
            Categories
          </h2>
          <CollectionManager config={categoryConfig} onRowsChange={setCategories} />
        </section>

        <section aria-labelledby="skills-heading" className="flex flex-col gap-3">
          <h2 id="skills-heading" className="text-lg font-semibold text-slate-900">
            Skills
          </h2>
          <SkillsByCategory categories={categories} />
        </section>
      </div>
    </>
  )
}

type SkillsState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; skills: Skill[] }

function fetchSkillsState(): Promise<SkillsState> {
  return listSkills().then(
    (skills) => ({ status: 'ready', skills }),
    (error: unknown) => ({ status: 'error', error: getErrorMessage(error) }),
  )
}

function SkillsByCategory({ categories }: { categories: SkillCategory[] }) {
  const { showToast } = useToast()
  const [state, setState] = useState<SkillsState>({ status: 'loading' })
  const [removing, setRemoving] = useState<Skill | null>(null)
  const [removeBusy, setRemoveBusy] = useState(false)

  const load = useCallback(async () => setState(await fetchSkillsState()), [])

  // Reload when categories change (a deleted category also deletes its skills).
  useEffect(() => {
    let cancelled = false
    fetchSkillsState().then((next) => {
      if (!cancelled) setState(next)
    })
    return () => {
      cancelled = true
    }
  }, [categories])

  async function handleRemove() {
    if (!removing) return
    setRemoveBusy(true)
    try {
      await removeSkill(removing.id)
      showToast(`Removed ${removing.name}.`)
      setRemoving(null)
      await load()
    } catch (error) {
      showToast(getSaveErrorMessage(error), 'error')
    } finally {
      setRemoveBusy(false)
    }
  }

  if (state.status === 'loading') return <SectionSpinner />
  if (state.status === 'error') return <LoadError message={state.error} onRetry={() => void load()} />
  if (categories.length === 0) {
    return <p className="text-sm text-slate-600">Add a category above to start adding skills.</p>
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {categories.map((category) => {
          const skills = state.skills.filter((skill) => skill.category_id === category.id)
          return (
            <li key={category.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-medium text-slate-900">{category.name}</h3>
              {skills.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <li
                      key={skill.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-3 pr-2 text-sm text-slate-800"
                    >
                      {skill.name}
                      <button
                        type="button"
                        onClick={() => setRemoving(skill)}
                        aria-label={`Remove ${skill.name}`}
                        className="rounded-full px-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No skills in this category yet.</p>
              )}
              <AddSkillForm
                category={category}
                existing={skills}
                onAdded={() => void load()}
              />
            </li>
          )
        })}
      </ul>

      <ConfirmDialog
        open={removing !== null}
        title="Remove skill?"
        message={removing ? `"${removing.name}" will be removed from your portfolio.` : ''}
        confirmLabel="Remove"
        busy={removeBusy}
        onConfirm={() => void handleRemove()}
        onCancel={() => setRemoving(null)}
      />
    </>
  )
}

function AddSkillForm({
  category,
  existing,
  onAdded,
}: {
  category: SkillCategory
  existing: Skill[]
  onAdded: () => void
}) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const inputId = `add-skill-${category.id}`

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Enter a skill name')
      return
    }
    if (existing.some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`${trimmed} is already in ${category.name}`)
      return
    }
    setError(null)
    setSaving(true)
    try {
      const nextOrder = existing.reduce((max, skill) => Math.max(max, skill.display_order + 1), 0)
      await addSkill(category.id, trimmed, nextOrder)
      showToast(`Added ${trimmed}.`)
      setName('')
      onAdded()
    } catch (saveError) {
      setError(getSaveErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-3 flex flex-col gap-1">
      <label htmlFor={inputId} className="sr-only">
        Add skill to {category.name}
      </label>
      <div className="flex gap-2">
        <input
          id={inputId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={`Add a skill to ${category.name}`}
          disabled={saving}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
        />
        <Button type="submit" variant="secondary" loading={saving}>
          Add
        </Button>
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}
