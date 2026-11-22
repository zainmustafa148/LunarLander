import clsx from 'clsx'
import { Loader, Wifi, WifiOff } from 'lucide-react'
import styles from './BackendStatus.module.css'

const STATUS = {
  connected: { label: 'Backend connected', title: 'The Flask backend answered its health check.', icon: Wifi, className: styles.connected },
  checking: { label: 'Checking backend', title: 'Contacting the backend.', icon: Loader, className: styles.notConnected },
  'not-connected': {
    label: 'Backend not connected',
    title: 'The configured backend did not answer its health check. The site still works on the static research data.',
    icon: WifiOff,
    className: styles.notConnected,
  },
  'not-configured': {
    label: 'Backend not connected',
    title: 'No backend is configured (VITE_API_BASE_URL is empty). The site works on the static research data.',
    icon: WifiOff,
    className: styles.notConnected,
  },
}

// Status is always shown with an icon and text, never colour alone.
export default function BackendStatus({ status }) {
  const { label, title, icon: Icon, className } = STATUS[status] ?? STATUS['not-connected']
  return (
    <span className={clsx(styles.pill, className)} role="status" title={title}>
      <Icon size={16} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </span>
  )
}
