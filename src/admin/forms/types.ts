export type FormValue = string | boolean | string[] | null

export type FormValues = Record<string, FormValue>

export type FieldErrors = Record<string, string>

type BaseField = {
  name: string
  label: string
  hint?: string
  required?: boolean
  /** Render at half width on larger screens. */
  half?: boolean
}

export type FieldConfig = BaseField &
  (
    | { type: 'text' | 'url' | 'email' | 'date'; placeholder?: string }
    | { type: 'textarea'; rows?: number; placeholder?: string }
    | { type: 'checkbox' }
    | { type: 'select'; options: readonly { value: string; label: string }[] }
    | { type: 'tags'; suggestions?: string[]; placeholder?: string }
    | { type: 'image'; folder: string; aspect?: 'square' | 'wide' }
  )

export type ImageFieldConfig = Extract<FieldConfig, { type: 'image' }>
