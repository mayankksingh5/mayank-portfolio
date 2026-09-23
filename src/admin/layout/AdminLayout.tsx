import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { RequireAdmin } from '@/admin/auth/RequireAdmin'
import { Sidebar } from '@/admin/layout/Sidebar'

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Close the mobile menu whenever the route changes.
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setMenuOpen(false)
  }

  return (
    <RequireAdmin>
      <div className="min-h-dvh bg-slate-50 lg:flex">
        <a
          href="#admin-main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
        >
          Skip to content
        </a>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <span className="font-semibold text-slate-900">Portfolio Admin</span>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="admin-sidebar"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800"
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </header>

        {menuOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar id="admin-sidebar" open={menuOpen} />

        <main id="admin-main" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </RequireAdmin>
  )
}
