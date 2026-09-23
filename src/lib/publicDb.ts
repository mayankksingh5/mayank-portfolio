import { PostgrestClient } from '@supabase/postgrest-js'
import { env } from '@/lib/env'
import type { Database } from '@/types/database'

/**
 * Lightweight, read-mostly client for the public site. It only talks to the
 * REST API as the anonymous role (RLS allows published reads and contact form
 * inserts), so visitors don't download the full supabase-js bundle, which is
 * only needed by the admin panel for auth and uploads.
 */
export const publicDb = new PostgrestClient<Database>(`${env.VITE_SUPABASE_URL}/rest/v1`, {
  headers: { apikey: env.VITE_SUPABASE_ANON_KEY },
})
