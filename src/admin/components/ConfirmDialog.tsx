import { Button } from '@/admin/components/Button'
import { Modal } from '@/admin/components/Modal'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={open} onClose={busy ? () => {} : onCancel} title={title} size="sm">
      <div className="px-5 py-4 text-sm text-slate-700">{message}</div>
      <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-3">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={busy}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
