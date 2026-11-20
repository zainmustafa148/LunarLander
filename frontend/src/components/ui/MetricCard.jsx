import Card from './Card.jsx'
import Skeleton from './Skeleton.jsx'
import styles from './MetricCard.module.css'

/*
 * One headline number with a label.
 * accentVar: a CSS variable name such as '--color-model-baseline' (adds a colour dot beside the label)
 * status:    'ready' | 'loading' | 'unavailable'
 * badge:     optional node (for example a <Badge>) shown beside the label
 */
export default function MetricCard({ label, value, unit, caption, accentVar, badge, status = 'ready' }) {
  return (
    <Card className={styles.card} role="group" aria-label={label}>
      <p className={styles.label}>
        {accentVar && <span className={styles.dot} style={{ background: `var(${accentVar})` }} aria-hidden="true" />}
        <span>{label}</span>
        {badge}
      </p>
      {status === 'loading' && <Skeleton width="55%" height="2rem" />}
      {status === 'unavailable' && (
        <p className={styles.value}>
          <span aria-hidden="true">—</span>
          <span className="visually-hidden">Not available</span>
        </p>
      )}
      {status === 'ready' && (
        <p className={styles.value}>
          {value}
          {unit && <span className={styles.unit}>{unit}</span>}
        </p>
      )}
      {caption && <p className={styles.caption}>{caption}</p>}
    </Card>
  )
}
