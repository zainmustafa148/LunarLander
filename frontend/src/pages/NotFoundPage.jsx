import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'

export default function NotFoundPage() {
  return (
    <>
      <PageHeader eyebrow="404" title="Page not found" description="There is no page at this address." />
      <EmptyState icon={Compass} title="Nothing here">
        <p>
          Use the sidebar, or <Link to="/">go back to the Overview</Link>.
        </p>
      </EmptyState>
    </>
  )
}
