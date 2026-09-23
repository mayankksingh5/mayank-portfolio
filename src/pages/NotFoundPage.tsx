import { Link } from 'react-router'
import { primaryButton } from '@/components/buttonStyles'

export default function NotFoundPage() {
  return (
    <div className="site">
      <title>Page not found</title>
      <meta name="robots" content="noindex" />
      <main className="relative z-10 mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-sm text-brand">// 404</p>
        <h1 className="text-gradient font-display text-4xl font-bold">Page not found</h1>
        <p className="text-fg-muted">The page you are looking for does not exist.</p>
        <Link to="/" className={`${primaryButton} mt-2`}>
          Back to home
        </Link>
      </main>
    </div>
  )
}
