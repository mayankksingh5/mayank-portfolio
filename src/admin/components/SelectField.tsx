import { useId, type SelectHTMLAttributes } from 'react'

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: readonly { value: string; label: string }[]
  error?: string
  hint?: string
}

export function SelectField({ label, options, error, hint, id, ...props }: SelectFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = error || hint ? `${inputId}-description` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
        {label}
        {props.required && <span className="text-red-600"> *</span>}
      </label>
      <select
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        className={`rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/20 ${error ? 'border-red-500' : 'border-slate-300'}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {descriptionId && (
        <p id={descriptionId} className={`text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
