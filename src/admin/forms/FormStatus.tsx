import { Alert } from '@/admin/components/Alert'
import { ProgressBar } from '@/admin/components/ProgressBar'
import type { EntityForm } from '@/admin/forms/useEntityForm'

/** Upload progress and form-level error for a useEntityForm instance. */
export function FormStatus({ form }: { form: EntityForm }) {
  return (
    <>
      {form.progress && <ProgressBar label={form.progress.label} percent={form.progress.percent} />}
      {form.formError && <Alert tone="error">{form.formError}</Alert>}
    </>
  )
}
