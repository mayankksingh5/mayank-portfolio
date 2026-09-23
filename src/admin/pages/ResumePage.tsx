import { useRef, useState, type ChangeEvent } from 'react'
import { Alert } from '@/admin/components/Alert'
import { Button } from '@/admin/components/Button'
import { ConfirmDialog } from '@/admin/components/ConfirmDialog'
import { LoadError } from '@/admin/components/LoadError'
import { PageHeader } from '@/admin/components/PageHeader'
import { ProgressBar } from '@/admin/components/ProgressBar'
import { SectionSpinner } from '@/admin/components/Spinner'
import { useToast } from '@/admin/toast/useToast'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getSaveErrorMessage } from '@/lib/errors'
import { formatFileSize } from '@/lib/format'
import {
  fetchSiteSettings,
  removeResume,
  replaceResume,
  resumeDownloadUrl,
} from '@/services/siteContent'
import { MAX_RESUME_BYTES } from '@/services/storage'

export default function ResumePage() {
  const settings = useAsyncData(fetchSiteSettings)
  const { showToast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [removing, setRemoving] = useState(false)

  const current = settings.status === 'success' ? settings.data : null
  const downloadUrl = current ? resumeDownloadUrl(current) : null
  const uploading = progress !== null

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null
    event.target.value = ''
    if (!selected) return
    if (selected.type !== 'application/pdf') {
      setFileError('Choose a PDF file.')
      return
    }
    if (selected.size > MAX_RESUME_BYTES) {
      setFileError(`PDF is too large (${formatFileSize(selected.size)}). Maximum is 10 MB.`)
      return
    }
    setFileError(null)
    setFile(selected)
  }

  async function handleUpload() {
    if (!file || !current) return
    setError(null)
    setProgress(0)
    try {
      await replaceResume(file, current.resume_path, setProgress)
      showToast('Resume uploaded. The Download Resume button now uses this file.')
      setFile(null)
      settings.reload()
    } catch (uploadError) {
      setError(getSaveErrorMessage(uploadError))
    } finally {
      setProgress(null)
    }
  }

  async function handleRemove() {
    if (!current) return
    setRemoving(true)
    try {
      await removeResume(current.resume_path)
      showToast('Resume removed.')
      setConfirmRemove(false)
      settings.reload()
    } catch (removeError) {
      showToast(getSaveErrorMessage(removeError), 'error')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Resume"
        description="The public Download Resume button always serves the latest file uploaded here."
      />

      {settings.status === 'loading' && <SectionSpinner />}
      {settings.status === 'error' && <LoadError message={settings.error} onRetry={settings.reload} />}

      {current && (
        <div className="flex flex-col gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Current resume</h2>
            {current.resume_path && downloadUrl ? (
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-700">
                  <p className="font-medium">{current.resume_file_name}</p>
                  {current.resume_updated_at && (
                    <p className="text-slate-500">
                      Uploaded {new Date(current.resume_updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <a
                    href={downloadUrl}
                    className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
                  >
                    Download
                  </a>
                  <Button variant="ghost" className="text-red-700" onClick={() => setConfirmRemove(true)}>
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                No resume uploaded yet. The Download Resume button is hidden until you upload one.
              </p>
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">
              {current.resume_path ? 'Replace resume' : 'Upload resume'}
            </h2>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              onChange={handleChange}
              className="sr-only"
              tabIndex={-1}
              aria-label="Choose resume PDF"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
                Choose PDF
              </Button>
              {file && (
                <span className="text-sm text-slate-700">
                  {file.name} ({formatFileSize(file.size)})
                </span>
              )}
            </div>
            {fileError && <p className="text-sm text-red-600">{fileError}</p>}
            {uploading && <ProgressBar label="Uploading resume" percent={progress} />}
            {error && <Alert tone="error">{error}</Alert>}
            <div>
              <Button onClick={() => void handleUpload()} disabled={!file} loading={uploading}>
                {current.resume_path ? 'Upload and replace' : 'Upload'}
              </Button>
            </div>
            <p className="text-xs text-slate-500">PDF only, up to 10 MB.</p>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={confirmRemove}
        title="Remove resume?"
        message="The Download Resume button will be hidden from your portfolio until you upload a new resume."
        confirmLabel="Remove"
        busy={removing}
        onConfirm={() => void handleRemove()}
        onCancel={() => setConfirmRemove(false)}
      />
    </>
  )
}
