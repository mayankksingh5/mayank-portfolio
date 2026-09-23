import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '@/admin/auth/useAuth'
import { Alert } from '@/admin/components/Alert'
import { Button } from '@/admin/components/Button'
import { FullPageSpinner } from '@/admin/components/Spinner'

/** Renders children only for a signed-in admin; otherwise redirects or explains why. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, loading, isAdmin, adminCheckError, signOut } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner label="Checking access" />

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4">
        <Alert tone="error" title={adminCheckError ? 'Could not verify access' : 'Access denied'}>
          {adminCheckError ?? 'This account does not have admin access to this portfolio.'}
        </Alert>
        <div className="flex gap-2">
          {adminCheckError && (
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Try again
            </Button>
          )}
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </main>
    )
  }

  return children
}
