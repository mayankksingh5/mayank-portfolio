import { useLocation } from 'react-router'
import { Alert } from '@/admin/components/Alert'
import { PageHeader } from '@/admin/components/PageHeader'
import { ADMIN_SECTIONS, adminHref } from '@/admin/navigation'

/** Temporary page for admin sections that are built in the next phase. */
export default function SectionPlaceholderPage() {
  const { pathname } = useLocation()
  const section = ADMIN_SECTIONS.find((item) => adminHref(item.path) === pathname)

  return (
    <>
      <PageHeader title={section?.label ?? 'Admin'} description={section?.description} />
      <Alert tone="info">This section is coming in the next phase.</Alert>
    </>
  )
}
