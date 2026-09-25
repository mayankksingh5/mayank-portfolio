import { useId, useState, type KeyboardEvent } from 'react'

/** Free-form tag input: type and press Enter or comma to add; click ✕ to remove. */
export function TagsField({
  label,
  value,
  onChange,
  suggestions = [],
  placeholder = 'Type and press Enter',
  hint,
  error,
  disabled,
}: {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
}) {
  const id = useId()
  const [draft, setDraft] = useState('')

  // Splits on commas too, so pasted "React, TypeScript" becomes two tags.
  function addTag(raw: string) {
    const next = [...value]
    for (const part of raw.split(',')) {
      const tag = part.trim()
      if (!tag || next.some((existing) => existing.toLowerCase() === tag.toLowerCase())) continue
      // Reuse the existing spelling of a known technology (e.g. "React" not "react").
      next.push(suggestions.find((s) => s.toLowerCase() === tag.toLowerCase()) ?? tag)
    }
    if (next.length > value.length) onChange(next)
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(draft)
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
      </label>
      <div
        className={`flex flex-wrap items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-slate-900/20 ${error ? 'border-red-500' : 'border-slate-300'}`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-800"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((existing) => existing !== tag))}
              disabled={disabled}
              aria-label={`Remove ${tag}`}
              className="text-slate-500 hover:text-slate-900"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : ''}
          list={suggestions.length > 0 ? `${id}-suggestions` : undefined}
          aria-describedby={error || hint ? `${id}-description` : undefined}
          className="min-w-32 flex-1 px-1 py-1 text-sm outline-none"
        />
      </div>
      {suggestions.length > 0 && (
        <datalist id={`${id}-suggestions`}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
      {(error || hint) && (
        <p id={`${id}-description`} className={`text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
