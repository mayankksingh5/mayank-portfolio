import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthContextValue = {
  session: Session | null
  /** True until the session and the admin check have both resolved. */
  loading: boolean
  isAdmin: boolean
  /** Set when the admin check itself failed (e.g. network error). */
  adminCheckError: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
