import clsx from 'clsx'
import { Wifi, WifiOff } from 'lucide-react'
import styles from './BackendStatus.module.css'

const STATUS = {
  connected: { label: 'Backend connected', icon: Wifi, className: styles.connected },
  'not-connected': { label: 'Backend not connected', icon: WifiOff, className: styles.notConnected },
}

// Status is always shown with an icon and text, never colour alone.
export default function BackendStatus({ status }) {
  const { label, icon: Icon, className } = STATUS[status] ?? STATUS['not-connected']
  return (
    <span className={clsx(styles.pill, className)} role="status" title={label}>
      <Icon size={16} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </span>
  )
}
