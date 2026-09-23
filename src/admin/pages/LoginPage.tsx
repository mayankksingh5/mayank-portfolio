import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { z } from 'zod'
import { useAuth } from '@/admin/auth/useAuth'
import { Alert } from '@/admin/components/Alert'
import { Button } from '@/admin/components/Button'
import { FullPageSpinner } from '@/admin/components/Spinner'
import { TextField } from '@/admin/components/TextField'

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

type FieldErrors = Partial<Record<'email' | 'password', string>>

export default function LoginPage() {
  const { session, loading, isAdmin, adminCheckError, signIn, signOut } = useAuth()
  const location = useLocation()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from
  const redirectTo = from?.startsWith('/admin') ? from : '/admin'

  if (loading && !submitting) return <FullPageSpinner label="Checking session" />
  if (session && isAdmin) return <Navigate to={redirectTo} replace />

  // Signed in, but not an admin: explain and offer to switch accounts.
  const signedInWithoutAccess = session && !loading && !isAdmin

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const parsed = loginSchema.safeParse({
      email: String(formData.get('email') ?? '').trim(),
      password: String(formData.get('password') ?? ''),
    })

    if (!parsed.success) {
      const errors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FieldErrors
        errors[field] ??= issue.message
      }
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setFormError(null)
    setSubmitting(true)
    const { error } = await signIn(parsed.data.email, parsed.data.password)
    setSubmitting(false)
    if (error) {
      setFormError(
        error === 'Invalid login credentials' ? 'Incorrect email or password.' : error,
      )
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
      <title>Sign in | Portfolio Admin</title>
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Portfolio Admin</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to manage your portfolio.</p>

        {signedInWithoutAccess ? (
          <div className="mt-6 flex flex-col gap-4">
            <Alert tone="error" title={adminCheckError ? 'Could not verify access' : 'Access denied'}>
              {adminCheckError ??
                `${session.user.email} does not have admin access to this portfolio.`}
            </Alert>
            <Button variant="secondary" onClick={signOut}>
              Sign in with a different account
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            {formError && <Alert tone="error">{formError}</Alert>}
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
              error={fieldErrors.email}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              error={fieldErrors.password}
            />
            <Button type="submit" loading={submitting}>
              Sign in
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
