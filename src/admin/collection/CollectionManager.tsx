import { useCallback, useEffect, useState } from 'react'
import type { z } from 'zod'
import { CollectionFormModal } from '@/admin/collection/CollectionFormModal'
import { Alert } from '@/admin/components/Alert'
import { Button } from '@/admin/components/Button'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { SectionSpinner } from '@/admin/components/Spinner'
import type { FieldConfig, FormValues } from '@/admin/forms/types'
import { useToast } from '@/admin/toast/useToast'
import { getErrorMessage, getSaveErrorMessage } from '@/lib/errors'
import type { CollectionService, OrderedRow } from '@/services/collection'
import { publicUrl } from '@/services/storage'

export type ItemSummary = {
  title: string
  subtitle?: string
  meta?: string
  badges?: string[]
  imagePath?: string | null
}

export type CollectionConfig<Row extends OrderedRow & { is_published?: boolean }> = {
  /** Lowercase singular noun, e.g. "experience". */
  itemName: string
  fields: FieldConfig[]
  schema: z.ZodType<Record<string, unknown>>
  emptyValues: FormValues
  toValues: (row: Row) => FormValues
  summarize: (row: Row) => ItemSummary
  service: CollectionService<Row>
  emptyMessage?: string
  /** Extra warning in the delete confirmation (e.g. what else gets deleted). */
  deleteWarning?: string
}

type LoadState<Row> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'ready'; rows: Row[] }

/** List + add/edit/delete/reorder UI for one ordered content table. */
export function CollectionManager<Row extends OrderedRow & { is_published?: boolean }>({
  config,
  onRowsChange,
}: {
  config: CollectionConfig<Row>
  /** Called with the latest rows after every load (lets a parent reuse them). */
  onRowsChange?: (rows: Row[]) => void
}) {
  const { itemName, service } = config
  const { showToast } = useToast()
  const [state, setState] = useState<LoadState<Row>>({ status: 'loading' })
  const [editing, setEditing] = useState<Row | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [reordering, setReordering] = useState(false)

  const applyState = useCallback(
    (next: LoadState<Row>) => {
      setState(next)
      if (next.status === 'ready') onRowsChange?.(next.rows)
    },
    [onRowsChange],
  )

  const fetchState = useCallback(
    (): Promise<LoadState<Row>> =>
      service.list().then(
        (rows) => ({ status: 'ready', rows }),
        (error: unknown) => ({ status: 'error', error: getErrorMessage(error) }),
      ),
    [service],
  )

  const load = useCallback(async () => applyState(await fetchState()), [applyState, fetchState])

  useEffect(() => {
    let cancelled = false
    fetchState().then((next) => {
      if (!cancelled) applyState(next)
    })
    return () => {
      cancelled = true
    }
  }, [applyState, fetchState])

  const rows = state.status === 'ready' ? state.rows : []

  async function handleSave(payload: Record<string, unknown>) {
    if (editing === 'new') {
      const nextOrder = rows.reduce((max, row) => Math.max(max, row.display_order + 1), 0)
      await service.create(payload, nextOrder)
      showToast(`Added ${itemName}.`)
    } else if (editing) {
      await service.update(editing.id, payload)
      showToast('Changes saved.')
    }
    await load()
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    try {
      await service.remove(deleting)
      showToast(`Deleted ${itemName}.`)
      setDeleting(null)
      await load()
    } catch (error) {
      showToast(getSaveErrorMessage(error), 'error')
    } finally {
      setDeleteBusy(false)
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= rows.length) return
    const reordered = [...rows]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    applyState({ status: 'ready', rows: reordered })
    setReordering(true)
    try {
      await service.reorder(reordered)
    } catch (error) {
      showToast(`Could not save the new order: ${getErrorMessage(error)}`, 'error')
    } finally {
      await load()
      setReordering(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button onClick={() => setEditing('new')}>Add {itemName}</Button>
      </div>

      {state.status === 'loading' && <SectionSpinner />}

      {state.status === 'error' && (
        <div className="flex flex-col items-start gap-3">
          <Alert tone="error" title="Could not load items">
            {state.error}
          </Alert>
          <Button variant="secondary" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      )}

      {state.status === 'ready' && rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
          {config.emptyMessage ?? `No ${itemName} added yet.`}
        </p>
      )}

      {rows.length > 0 && (
        <ul className="flex flex-col gap-2" aria-busy={reordering || undefined}>
          {rows.map((row, index) => {
            const summary = config.summarize(row)
            const hidden = row.is_published === false
            return (
              <li
                key={row.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
              >
                {summary.imagePath !== undefined && (
                  <div className="size-14 shrink-0 overflow-hidden rounded bg-slate-100">
                    {summary.imagePath && (
                      <img
                        src={publicUrl('media', summary.imagePath)}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900">{summary.title}</p>
                    {hidden && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                        Hidden
                      </span>
                    )}
                    {summary.badges?.map((badge) => (
                      <span
                        key={badge}
                        className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  {summary.subtitle && (
                    <p className="truncate text-sm text-slate-600">{summary.subtitle}</p>
                  )}
                  {summary.meta && <p className="text-xs text-slate-500">{summary.meta}</p>}
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => void move(index, -1)}
                    disabled={index === 0 || reordering}
                    aria-label={`Move ${summary.title} up`}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => void move(index, 1)}
                    disabled={index === rows.length - 1 || reordering}
                    aria-label={`Move ${summary.title} down`}
                  >
                    ↓
                  </Button>
                  <Button variant="secondary" onClick={() => setEditing(row)}>
                    Edit
                  </Button>
                  <Button variant="ghost" className="text-red-700" onClick={() => setDeleting(row)}>
                    Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editing && (
        <CollectionFormModal
          key={editing === 'new' ? 'new' : editing.id}
          title={editing === 'new' ? `Add ${itemName}` : `Edit ${itemName}`}
          fields={config.fields}
          schema={config.schema}
          initialValues={editing === 'new' ? config.emptyValues : config.toValues(editing)}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${itemName}?`}
        message={
          deleting
            ? `"${config.summarize(deleting).title}" will be permanently deleted.${config.deleteWarning ? ` ${config.deleteWarning}` : ''} This cannot be undone.`
            : ''
        }
        busy={deleteBusy}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
