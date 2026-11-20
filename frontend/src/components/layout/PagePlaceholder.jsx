import { Clock } from 'lucide-react'
import EmptyState from '../ui/EmptyState.jsx'
import PageHeader from './PageHeader.jsx'
import styles from './PagePlaceholder.module.css'

// Shared placeholder for pages that are built in later phases.
// It lists planned content from the approved plan and shows no data of any kind.
export default function PagePlaceholder({ eyebrow, title, description, planned, note }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <EmptyState icon={Clock} title="This page is not built yet">
        <p>
          It will be implemented in Phase 6. Nothing is shown here until real results from the report are wired in.
        </p>
        <p className={styles.listTitle}>Planned content</p>
        <ul className={styles.list}>
          {planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {note && <p className={styles.note}>{note}</p>}
      </EmptyState>
    </>
  )
}
