import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/admin/components/Button'
import { formatFileSize } from '@/lib/format'
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_INPUT_BYTES, publicUrl } from '@/services/storage'

/**
 * Image picker with a local preview. The file is only uploaded when the form
 * is saved (see useEntityForm), so cancelling never leaves stray uploads.
 */
export function ImageField({
  label,
  path,
  pendingFile,
  onSelect,
  hint,
  error,
  aspect = 'wide',
  disabled,
}: {
  label: string
  path: string | null
  pendingFile: File | null
  onSelect: (file: File | null) => void
  hint?: string
  error?: string
  aspect?: 'square' | 'wide'
  disabled?: boolean
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Object URLs are an external resource: create per file, revoke on change.
  useEffect(() => {
    if (!pendingFile) return
    const url = URL.createObjectURL(pendingFile)
    // eslint-disable-next-line react/set-state-in-effect
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingFile])

  const shownUrl = pendingFile ? previewUrl : path ? publicUrl('media', path) : null

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setLocalError('Choose a JPG, PNG, WebP or AVIF image.')
      return
    }
    if (file.size > MAX_IMAGE_INPUT_BYTES) {
      setLocalError(`Image is too large (${formatFileSize(file.size)}). Maximum is 15 MB.`)
      return
    }
    setLocalError(null)
    onSelect(file)
  }

  const message = localError ?? error
  const aspectClass = aspect === 'square' ? 'aspect-square w-32' : 'aspect-video w-full max-w-xs'

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${id}-label`} className="text-sm font-medium text-slate-800">
        {label}
      </span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={`${aspectClass} flex items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-slate-50`}
        >
          {shownUrl ? (
            <img src={shownUrl} alt={`${label} preview`} className="size-full object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-slate-500">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleChange}
            aria-labelledby={`${id}-label`}
            className="sr-only"
            tabIndex={-1}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              aria-describedby={message || hint ? `${id}-description` : undefined}
            >
              {shownUrl ? 'Change image' : 'Choose image'}
            </Button>
            {shownUrl && (
              <Button variant="ghost" onClick={() => onSelect(null)} disabled={disabled}>
                Remove
              </Button>
            )}
          </div>
          {pendingFile && (
            <p className="text-xs text-slate-600">
              New: {pendingFile.name} ({formatFileSize(pendingFile.size)}). Uploads when you save.
            </p>
          )}
          {(message || hint) && (
            <p
              id={`${id}-description`}
              className={`text-xs ${message ? 'text-red-600' : 'text-slate-500'}`}
            >
              {message ?? hint}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
