import { useId, type InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, id, className = '', ...props }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = error || hint ? `${inputId}-description` : undefined

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-slate-800">
        {label}
        {props.required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptionId}
        className={`rounded-md border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-900/20 ${error ? 'border-red-500' : 'border-slate-300 focus:border-slate-500'}`}
        {...props}
      />
      {descriptionId && (
        <p id={descriptionId} className={`text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
