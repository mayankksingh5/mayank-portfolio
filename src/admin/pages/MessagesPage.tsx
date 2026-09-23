import { useState } from 'react'
import { Button } from '@/admin/components/Button'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { LoadError } from '@/admin/components/LoadError'
import { PageHeader } from '@/admin/components/PageHeader'
import { SectionSpinner } from '@/admin/components/Spinner'
import { useToast } from '@/admin/toast/useToast'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getSaveErrorMessage } from '@/lib/errors'
import { deleteMessage, listMessages, setMessageRead } from '@/services/messages'
import type { ContactMessage } from '@/types/database'

export default function MessagesPage() {
  const messages = useAsyncData(listMessages)
  const { showToast } = useToast()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<ContactMessage | null>(null)

  async function toggleRead(message: ContactMessage) {
    setBusyId(message.id)
    try {
      await setMessageRead(message.id, !message.is_read)
      messages.reload()
    } catch (error) {
      showToast(getSaveErrorMessage(error), 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setBusyId(deleting.id)
    try {
      await deleteMessage(deleting.id)
      showToast('Message deleted.')
      setDeleting(null)
      messages.reload()
    } catch (error) {
      showToast(getSaveErrorMessage(error), 'error')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <PageHeader title="Messages" description="Messages sent through the contact form on your portfolio." />

      {messages.status === 'loading' && <SectionSpinner />}
      {messages.status === 'error' && <LoadError message={messages.error} onRetry={messages.reload} />}
      {messages.status === 'success' && messages.data.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-600">
          No messages yet.
        </p>
      )}

      {messages.status === 'success' && messages.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {messages.data.map((message) => (
            <li
              key={message.id}
              className={`rounded-lg border bg-white p-4 ${message.is_read ? 'border-slate-200' : 'border-slate-900'}`}
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {message.name}
                    {!message.is_read && (
                      <span className="ml-2 rounded bg-slate-900 px-1.5 py-0.5 text-xs font-medium text-white">
                        New
                      </span>
                    )}
                  </p>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-sm text-slate-600 underline-offset-2 hover:underline"
                  >
                    {message.email}
                  </a>
                </div>
                <time dateTime={message.created_at} className="text-xs text-slate-500">
                  {new Date(message.created_at).toLocaleString()}
                </time>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{message.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={`mailto:${message.email}?subject=${encodeURIComponent('Re: your message')}`}
                  className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                >
                  Reply
                </a>
                <Button
                  variant="ghost"
                  onClick={() => void toggleRead(message)}
                  loading={busyId === message.id && !deleting}
                >
                  Mark as {message.is_read ? 'unread' : 'read'}
                </Button>
                <Button variant="ghost" className="text-red-700" onClick={() => setDeleting(message)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete message?"
        message={deleting ? `The message from ${deleting.name} will be permanently deleted.` : ''}
        busy={deleting !== null && busyId === deleting.id}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
