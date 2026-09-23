/**
 * Admin entry point (lazy-loaded). Authentication, the sidebar layout and the
 * content management modules are added in the following phases.
 */
export default function AdminApp() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Admin</h1>
      <p className="text-slate-600">The admin panel is not set up yet.</p>
    </main>
  )
}
