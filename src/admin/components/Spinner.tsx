export function Spinner({ className = 'size-5' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
    />
  )
}

export function FullPageSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-dvh items-center justify-center gap-3 text-slate-600">
      <Spinner />
      <span>{label}…</span>
    </div>
  )
}

export function SectionSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-12 text-slate-600">
      <Spinner />
      <span>{label}…</span>
    </div>
  )
}
