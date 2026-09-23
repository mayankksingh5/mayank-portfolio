/**
 * Validates required public environment variables at startup.
 * Kept dependency-free so it adds nothing to the public bundle.
 */
function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function readEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const problems: string[] = []

  if (!url || !isValidUrl(url)) problems.push('- VITE_SUPABASE_URL must be a valid URL')
  if (!anonKey) problems.push('- VITE_SUPABASE_ANON_KEY is required')

  if (problems.length > 0) {
    throw new Error(
      `Missing or invalid environment variables:\n${problems.join('\n')}\n\nCopy .env.example to .env.local and fill in your portfolio Supabase project values.`,
    )
  }

  return { VITE_SUPABASE_URL: url!, VITE_SUPABASE_ANON_KEY: anonKey! }
}

export const env = readEnv()
