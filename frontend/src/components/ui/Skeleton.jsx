import clsx from 'clsx'
import styles from './Skeleton.module.css'

// Decorative placeholder block. It is hidden from assistive technology; the component that shows
// it must announce loading itself (see DataState).
export default function Skeleton({ width = '100%', height = '1rem', radius, className, style, ...props }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius, ...style }}
      {...props}
    />
  )
}
