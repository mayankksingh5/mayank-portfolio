/** Turns any thrown value (Error, Supabase error object, string) into a readable message. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  if (typeof error === 'string' && error) return error
  return fallback
}

/** Maps common Postgres error codes to messages an admin can act on. */
export function getSaveErrorMessage(error: unknown) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code: unknown }).code
      : null

  switch (code) {
    case '23505':
      return 'An item with the same name or slug already exists.'
    case '23514':
      return 'Some values are not allowed. Check that links start with https:// and dates are in order.'
    case '42501':
      return 'You do not have permission to do this. Try signing in again.'
    default:
      return getErrorMessage(error)
  }
}
