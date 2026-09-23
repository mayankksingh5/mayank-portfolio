import { NavLink } from 'react-router'
import { useAuth } from '@/admin/auth/useAuth'
import { ADMIN_SECTIONS, adminHref } from '@/admin/navigation'

export function Sidebar({ id, open }: { id: string; open: boolean }) {
  const { session, signOut } = useAuth()

  return (
    <aside
      id={id}
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${open ? 'translate-x-0' : 'invisible -translate-x-full lg:visible'}`}
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="font-semibold text-slate-900">Portfolio Admin</p>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-500 underline-offset-2 hover:underline"
        >
          View live site ↗
        </a>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-0.5">
          {ADMIN_SECTIONS.map((section) => (
            <li key={section.path}>
              <NavLink
                to={adminHref(section.path)}
                end={section.path === ''}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {section.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-slate-200 px-5 py-4">
        <p className="truncate text-xs text-slate-500" title={session?.user.email}>
          {session?.user.email}
        </p>
        <button
          type="button"
          onClick={signOut}
          className="mt-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
