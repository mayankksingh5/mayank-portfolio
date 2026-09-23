import { Alert } from '@/admin/components/Alert'
import { Button } from '@/admin/components/Button'

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <Alert tone="error" title="Could not load">
        {message}
      </Alert>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}
