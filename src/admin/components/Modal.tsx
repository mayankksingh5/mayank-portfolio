import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Accessible modal built on the native <dialog> element (focus trapping and
 * Escape handling come from the browser). `onClose` may ignore the request,
 * e.g. while a save is in progress.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'lg',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'lg'
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      className={`m-auto w-[calc(100%-2rem)] rounded-lg bg-white p-0 shadow-xl backdrop:bg-slate-900/50 ${size === 'sm' ? 'max-w-md' : 'max-w-2xl'}`}
    >
      {open && (
        <div className="flex max-h-[90dvh] flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
