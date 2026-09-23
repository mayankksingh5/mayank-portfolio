import { CheckboxField } from '@/admin/components/CheckboxField'
import { ImageField } from '@/admin/components/ImageField'
import { SelectField } from '@/admin/components/SelectField'
import { TagsField } from '@/admin/components/TagsField'
import { TextAreaField } from '@/admin/components/TextAreaField'
import { TextField } from '@/admin/components/TextField'
import type { FieldConfig } from '@/admin/forms/types'
import type { EntityForm } from '@/admin/forms/useEntityForm'

/** Renders a list of field configs bound to a useEntityForm instance. */
export function FormFields({ fields, form }: { fields: FieldConfig[]; form: EntityForm }) {
  const { values, errors, pendingFiles, submitting, setField, setFile } = form

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const span = field.half ? '' : 'sm:col-span-2'
        const error = errors[field.name]
        const common = {
          label: field.label,
          hint: field.hint,
          error,
          disabled: submitting,
        }

        let control
        switch (field.type) {
          case 'textarea':
            control = (
              <TextAreaField
                {...common}
                name={field.name}
                required={field.required}
                rows={field.rows}
                placeholder={field.placeholder}
                value={(values[field.name] as string) ?? ''}
                onChange={(event) => setField(field.name, event.target.value)}
              />
            )
            break
          case 'checkbox':
            control = (
              <CheckboxField
                label={field.label}
                hint={field.hint}
                disabled={submitting}
                checked={Boolean(values[field.name])}
                onChange={(checked) => setField(field.name, checked)}
              />
            )
            break
          case 'select':
            control = (
              <SelectField
                {...common}
                name={field.name}
                required={field.required}
                options={field.options}
                value={(values[field.name] as string) ?? ''}
                onChange={(event) => setField(field.name, event.target.value)}
              />
            )
            break
          case 'tags':
            control = (
              <TagsField
                {...common}
                suggestions={field.suggestions}
                placeholder={field.placeholder}
                value={(values[field.name] as string[]) ?? []}
                onChange={(tags) => setField(field.name, tags)}
              />
            )
            break
          case 'image':
            control = (
              <ImageField
                {...common}
                aspect={field.aspect}
                path={(values[field.name] as string | null) ?? null}
                pendingFile={pendingFiles[field.name] ?? null}
                onSelect={(file) => setFile(field.name, file)}
              />
            )
            break
          default:
            control = (
              <TextField
                {...common}
                name={field.name}
                type={field.type}
                required={field.required}
                placeholder={field.placeholder}
                value={(values[field.name] as string) ?? ''}
                onChange={(event) => setField(field.name, event.target.value)}
              />
            )
        }

        return (
          <div key={field.name} className={span}>
            {control}
          </div>
        )
      })}
    </div>
  )
}
