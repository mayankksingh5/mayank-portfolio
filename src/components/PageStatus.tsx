/** Full-page loading and error states for public pages that load data. */

export function LoadingScreen({ label }: { label: string }) {
  return (
    <div role="status" className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-4">
      <span
        aria-hidden="true"
        className="size-10 animate-spin rounded-full border-2 border-brand/30 border-t-brand"
      />
      <span className="font-mono text-xs text-fg-subtle">{label}</span>
    </div>
  )
}

export function ErrorScreen({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-2xl font-bold text-fg">Something went wrong</h1>
      <p className="max-w-sm text-sm text-fg-muted">
        The {what} could not be loaded. Please check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg border border-white/12 bg-white/6 px-5 py-2.5 text-sm font-medium text-fg hover:bg-white/10"
      >
        Try again
      </button>
    </main>
  )
}
