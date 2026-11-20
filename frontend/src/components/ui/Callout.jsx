import clsx from 'clsx'
import { TriangleAlert, Info } from 'lucide-react'
import styles from './Callout.module.css'

const ICONS = { info: Info, warning: TriangleAlert }

export default function Callout({ tone = 'info', title, children }) {
  const Icon = ICONS[tone]
  return (
    <aside className={clsx(styles.callout, styles[tone])}>
      <Icon size={20} aria-hidden="true" className={styles.icon} />
      <div>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.body}>{children}</div>
      </div>
    </aside>
  )
}
