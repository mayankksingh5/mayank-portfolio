import { useCallback, useRef, useState } from 'react'
import type { z } from 'zod'
import type { FieldConfig, FieldErrors, FormValue, FormValues } from '@/admin/forms/types'
import { toFieldErrors } from '@/admin/forms/validation'
import { getSaveErrorMessage } from '@/lib/errors'
import { deleteFiles, uploadImage } from '@/services/storage'

export type UploadProgress = { label: string; percent: number }

/** Converts a saved payload back into form values (null text -> empty string). */
function valuesFromPayload(fields: FieldConfig[], payload: Record<string, unknown>): FormValues {
  const next: FormValues = {}
  for (const field of fields) {
    const value = payload[field.name]
    if (field.type === 'image') next[field.name] = typeof value === 'string' ? value : null
    else if (field.type === 'checkbox') next[field.name] = Boolean(value)
    else if (field.type === 'tags') next[field.name] = Array.isArray(value) ? (value as string[]) : []
    else next[field.name] = typeof value === 'string' ? value : ''
  }
  return next
}

type Options = {
  fields: FieldConfig[]
  schema: z.ZodType<Record<string, unknown>>
  initialValues: FormValues
}

/**
 * Form state + submit pipeline shared by every admin form:
 * validate -> upload new images (with progress) -> save -> clean up old images.
 */
export function useEntityForm({ fields, schema, initialValues }: Options) {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({})
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const savedValues = useRef(initialValues)

  const setField = useCallback((name: string, value: FormValue) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!(name in current)) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }, [])

  const setFile = useCallback(
    (name: string, file: File | null) => {
      setPendingFiles((current) => ({ ...current, [name]: file }))
      // Removing an image clears the stored path; selecting keeps it until upload.
      if (!file) setField(name, null)
    },
    [setField],
  )

  const reset = useCallback((next: FormValues) => {
    savedValues.current = next
    setValues(next)
    setErrors({})
    setPendingFiles({})
    setFormError(null)
  }, [])

  const submit = useCallback(
    async (save: (payload: Record<string, unknown>) => Promise<void>) => {
      const parsed = schema.safeParse(values)
      if (!parsed.success) {
        setErrors(toFieldErrors(parsed.error))
        setFormError('Please fix the highlighted fields.')
        return null
      }

      setErrors({})
      setFormError(null)
      setSubmitting(true)
      const uploaded: string[] = []

      try {
        const payload = { ...parsed.data }

        for (const field of fields) {
          const file = pendingFiles[field.name]
          if (field.type !== 'image' || !file) continue
          const label = `Uploading ${field.label.toLowerCase()}`
          setProgress({ label, percent: 0 })
          const path = await uploadImage(file, field.folder, (percent) =>
            setProgress({ label, percent }),
          )
          uploaded.push(path)
          payload[field.name] = path
        }
        setProgress(null)

        await save(payload)

        // The row now points at the new images, so replaced files can go.
        const replaced = fields.flatMap((field) => {
          if (field.type !== 'image') return []
          const oldPath = savedValues.current[field.name]
          return typeof oldPath === 'string' && oldPath !== payload[field.name] ? [oldPath] : []
        })
        void deleteFiles('media', replaced)

        reset(valuesFromPayload(fields, payload))
        return payload
      } catch (error) {
        void deleteFiles('media', uploaded)
        setFormError(getSaveErrorMessage(error))
        return null
      } finally {
        setSubmitting(false)
        setProgress(null)
      }
    },
    [fields, pendingFiles, reset, schema, values],
  )

  return {
    values,
    errors,
    pendingFiles,
    progress,
    submitting,
    formError,
    setField,
    setFile,
    reset,
    submit,
  }
}

export type EntityForm = ReturnType<typeof useEntityForm>
