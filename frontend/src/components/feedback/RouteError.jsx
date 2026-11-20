import { Info } from 'lucide-react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import PageHeader from '../layout/PageHeader.jsx'
import EmptyState from '../ui/EmptyState.jsx'

export default function RouteError() {
  const error = useRouteError()
  const detail = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <>
      <PageHeader eyebrow="Error" title="Something went wrong" description="This page could not be displayed." />
      <EmptyState icon={Info} title="Unexpected error">
        <p>
          <code>{detail}</code>
        </p>
        <p>
          Try reloading the page, or <Link to="/">return to the Overview</Link>.
        </p>
      </EmptyState>
    </>
  )
}
