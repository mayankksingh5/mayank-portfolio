import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext, type AuthContextValue } from '@/admin/auth/AuthContext'
import { getErrorMessage } from '@/lib/errors'
import { supabase } from '@/lib/supabase'

type AdminCheck = { userId: string; isAdmin: boolean; error: string | null }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [adminCheck, setAdminCheck] = useState<AdminCheck | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })

    // Only store the session here; Supabase advises against awaiting other
    // Supabase calls inside this callback.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setSessionLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Re-check admin membership only when the signed-in user changes, not on
  // every token refresh.
  const userId = session?.user.id ?? null
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (cancelled) return
      setAdminCheck({
        userId,
        isAdmin: !error && data === true,
        error: error ? getErrorMessage(error) : null,
      })
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? getErrorMessage(error) : null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const currentCheck = userId && adminCheck?.userId === userId ? adminCheck : null

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading: sessionLoading || (userId !== null && currentCheck === null),
      isAdmin: currentCheck?.isAdmin ?? false,
      adminCheckError: currentCheck?.error ?? null,
      signIn,
      signOut,
    }),
    [session, sessionLoading, userId, currentCheck, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
