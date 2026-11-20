import { Info, TriangleAlert } from 'lucide-react'
import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import Skeleton from '../ui/Skeleton.jsx'
import styles from './DataState.module.css'

/*
 * Stands in for a chart or table while its data is not ready.
 * status:   'loading' | 'unavailable' | 'error'
 * title:    what is being loaded, for example "Episode length"
 * problems: [{ id, file, reason }] from summarize() in utils/dataStore.js
 * onRetry:  optional; shows a "Try again" button
 * The loading state reserves the chart's height so the page does not jump when data arrives.
 */
export default function DataState({ status, title, problems = [], onRetry, height = '20rem' }) {
  if (status === 'loading') {
    return (
      <Card aria-busy="true">
        <div role="status">
          <span className="visually-hidden">{`Loading ${title}`}</span>
          <p className={styles.title} aria-hidden="true">
            {title}
          </p>
          <Skeleton height={height} />
        </div>
      </Card>
    )
  }

  const isError = status === 'error'
  return (
    <EmptyState
      icon={isError ? TriangleAlert : Info}
      title={isError ? `${title}: data could not be loaded` : `${title}: data unavailable`}
    >
      {problems.length > 0 && (
        <ul className={styles.problems}>
          {problems.map((problem) => (
            <li key={problem.id}>
              <code>{problem.file ?? problem.id}</code>: {problem.reason}
            </li>
          ))}
        </ul>
      )}
      {!isError && (
        <p>
          No values are shown because none are available. Generate the data files with{' '}
          <code>node scripts/csv-to-json.mjs</code> from the <code>frontend</code> folder, then reload the page.
        </p>
      )}
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </EmptyState>
  )
}
