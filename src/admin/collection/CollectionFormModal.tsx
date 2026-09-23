import type { FormEvent } from 'react'
import { Button } from '@/admin/components/Button'
import { Modal } from '@/admin/components/Modal'
import { FormFields } from '@/admin/forms/FormFields'
import { FormStatus } from '@/admin/forms/FormStatus'
import type { FieldConfig, FormValues } from '@/admin/forms/types'
import { useEntityForm } from '@/admin/forms/useEntityForm'
import type { z } from 'zod'

/** Add/edit form in a modal. Mounted fresh for each item so state never leaks. */
export function CollectionFormModal({
  title,
  fields,
  schema,
  initialValues,
  onSave,
  onClose,
}: {
  title: string
  fields: FieldConfig[]
  schema: z.ZodType<Record<string, unknown>>
  initialValues: FormValues
  onSave: (payload: Record<string, unknown>) => Promise<void>
  onClose: () => void
}) {
  const form = useEntityForm({ fields, schema, initialValues })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const saved = await form.submit(onSave)
    if (saved) onClose()
  }

  return (
    <Modal open onClose={form.submitting ? () => {} : onClose} title={title}>
      <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
          <FormFields fields={fields} form={form} />
          <FormStatus form={form} />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
          <Button variant="secondary" onClick={onClose} disabled={form.submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={form.submitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
