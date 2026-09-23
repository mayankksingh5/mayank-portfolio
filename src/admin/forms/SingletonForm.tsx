import type { FormEvent } from 'react'
import type { z } from 'zod'
import { Button } from '@/admin/components/Button'
import { FormFields } from '@/admin/forms/FormFields'
import { FormStatus } from '@/admin/forms/FormStatus'
import type { FieldConfig, FormValues } from '@/admin/forms/types'
import { useEntityForm } from '@/admin/forms/useEntityForm'
import { useToast } from '@/admin/toast/useToast'

/** Inline edit form for single-row content (profile, site settings). */
export function SingletonForm({
  fields,
  schema,
  initialValues,
  onSave,
}: {
  fields: FieldConfig[]
  schema: z.ZodType<Record<string, unknown>>
  initialValues: FormValues
  onSave: (payload: Record<string, unknown>) => Promise<void>
}) {
  const form = useEntityForm({ fields, schema, initialValues })
  const { showToast } = useToast()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const saved = await form.submit(onSave)
    if (saved) showToast('Changes saved.')
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5"
    >
      <FormFields fields={fields} form={form} />
      <FormStatus form={form} />
      <div>
        <Button type="submit" loading={form.submitting}>
          Save changes
        </Button>
      </div>
    </form>
  )
}
