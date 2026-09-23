import { Outlet } from 'react-router'
import { AuthProvider } from '@/admin/auth/AuthProvider'
import { ToastProvider } from '@/admin/toast/ToastProvider'

/** Shared providers for every /admin route (lazy-loaded with the admin chunk). */
export default function AdminRoot() {
  return (
    <AuthProvider>
      <ToastProvider>
        <meta name="robots" content="noindex, nofollow" />
        <Outlet />
      </ToastProvider>
    </AuthProvider>
  )
}
