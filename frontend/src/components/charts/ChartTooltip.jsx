import styles from './ChartTooltip.module.css'

/*
 * Tooltip body shared by the new charts.
 * rows: [{ key, color, label, value, detail }]   (color is a resolved colour from useChartTheme)
 */
export default function ChartTooltip({ title, rows }) {
  return (
    <div className={styles.tooltip}>
      <p className={styles.title}>{title}</p>
      <ul className={styles.rows}>
        {rows.map((row) => (
          <li key={row.key} className={styles.row}>
            <span className={styles.swatch} style={{ background: row.color }} aria-hidden="true" />
            <span className={styles.text}>
              <span className={styles.label}>{row.label}</span> <span className={styles.value}>{row.value}</span>
              {row.detail && <span className={styles.detail}>{row.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
