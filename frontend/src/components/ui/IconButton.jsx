import clsx from 'clsx'
import styles from './IconButton.module.css'

// `ref` is a normal prop in React 19, so it flows through ...props.
export default function IconButton({ icon: Icon, label, className, ...props }) {
  return (
    <button type="button" className={clsx(styles.button, className)} aria-label={label} title={label} {...props}>
      <Icon size={20} aria-hidden="true" />
    </button>
  )
}
