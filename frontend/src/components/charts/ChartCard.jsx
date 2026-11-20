import Card from '../ui/Card.jsx'
import styles from './ChartCard.module.css'

// `summary` is the text alternative for the chart; the page also provides a data table.
export default function ChartCard({ title, subtitle, summary, footnote, children }) {
  return (
    <Card as="figure" className={styles.card}>
      <figcaption className={styles.caption}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </figcaption>
      <div className={styles.chart} role="img" aria-label={summary}>
        {children}
      </div>
      {footnote && <p className={styles.footnote}>{footnote}</p>}
    </Card>
  )
}
