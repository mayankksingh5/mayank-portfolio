import { Link } from 'react-router'
import { Alert } from '@/admin/components/Alert'
import { Button } from '@/admin/components/Button'
import { PageHeader } from '@/admin/components/PageHeader'
import { SectionSpinner } from '@/admin/components/Spinner'
import { adminHref } from '@/admin/navigation'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchDashboardSummary, type CountedTable } from '@/services/dashboard'

const COUNT_CARDS: { table: CountedTable; label: string; path: string }[] = [
  { table: 'experiences', label: 'Experience', path: 'experience' },
  { table: 'projects', label: 'Projects', path: 'projects' },
  { table: 'skills', label: 'Skills', path: 'skills' },
  { table: 'education', label: 'Education', path: 'education' },
  { table: 'certifications', label: 'Certifications', path: 'certifications' },
  { table: 'achievements', label: 'Achievements', path: 'achievements' },
  { table: 'social_links', label: 'Social Links', path: 'social-links' },
  { table: 'stats', label: 'Stats', path: 'stats' },
]

export default function DashboardPage() {
  const summary = useAsyncData(fetchDashboardSummary)

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of your portfolio content." />

      {summary.status === 'loading' && <SectionSpinner label="Loading overview" />}

      {summary.status === 'error' && (
        <div className="flex flex-col items-start gap-3">
          <Alert tone="error" title="Could not load the overview">
            {summary.error}
          </Alert>
          <Button variant="secondary" onClick={summary.reload}>
            Try again
          </Button>
        </div>
      )}

      {summary.status === 'success' && (
        <div className="flex flex-col gap-6">
          {summary.data.unreadMessages > 0 && (
            <Link
              to={adminHref('messages')}
              className="rounded-lg border border-slate-900 bg-white p-4 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              You have {summary.data.unreadMessages} unread message
              {summary.data.unreadMessages === 1 ? '' : 's'} →
            </Link>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {COUNT_CARDS.map((card) => (
              <li key={card.table}>
                <Link
                  to={adminHref(card.path)}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
                >
                  <p className="text-2xl font-bold text-slate-900">{summary.data.counts[card.table]}</p>
                  <p className="text-sm text-slate-600">{card.label}</p>
                </Link>
              </li>
            ))}
          </ul>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold text-slate-900">Resume</h2>
            {summary.data.resumeFileName ? (
              <p className="mt-1 text-sm text-slate-600">
                {summary.data.resumeFileName}
                {summary.data.resumeUpdatedAt &&
                  `, uploaded ${new Date(summary.data.resumeUpdatedAt).toLocaleDateString()}`}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-600">No resume uploaded yet.</p>
            )}
            <Link
              to={adminHref('resume')}
              className="mt-3 inline-block text-sm font-medium text-slate-900 underline underline-offset-4"
            >
              Manage resume
            </Link>
          </section>
        </div>
      )}
    </>
  )
}
