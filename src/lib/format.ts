/** Parses a Postgres `date` (YYYY-MM-DD) as a local date, avoiding timezone shifts. */
function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })

export function formatMonthYear(value: string | null | undefined) {
  return value ? monthYear.format(parseDate(value)) : ''
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  isCurrent = false,
  separator = ' – ',
) {
  const from = formatMonthYear(start)
  const to = isCurrent ? 'Present' : formatMonthYear(end)
  if (from && to) return `${from}${separator}${to}`
  return from || to
}

export function formatYearRange(start: string | null | undefined, end: string | null | undefined) {
  const from = start?.slice(0, 4) ?? ''
  const to = end?.slice(0, 4) ?? ''
  if (from && to) return from === to ? from : `${from} — ${to}`
  return from || to
}

/** "https://www.example.com/path" -> "example.com/path" (for display). */
export function displayUrl(url: string) {
  return url
    .replace(/^mailto:/i, '')
    .replace(/^https?:\/\/(www\.)?/i, '')
    .replace(/\/$/, '')
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
