import clsx from 'clsx'
import styles from './Badge.module.css'

// Tone is always paired with a text label, never colour alone.
export default function Badge({ tone = 'neutral', children }) {
  return <span className={clsx(styles.badge, styles[tone])}>{children}</span>
}
