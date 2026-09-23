import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="text-slate-600">The page you are looking for does not exist.</p>
      <Link to="/" className="font-medium text-slate-900 underline underline-offset-4">
        Back to home
      </Link>
    </main>
  )
}
