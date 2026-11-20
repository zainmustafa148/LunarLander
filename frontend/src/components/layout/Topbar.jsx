import { Menu } from 'lucide-react'
import BackendStatus from '../feedback/BackendStatus.jsx'
import IconButton from '../ui/IconButton.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import styles from './Topbar.module.css'

export default function Topbar({ title, backendStatus, menuOpen, onMenuClick, menuButtonRef }) {
  return (
    <header className={styles.topbar}>
      <IconButton
        ref={menuButtonRef}
        icon={Menu}
        label="Open navigation"
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
      />
      {/* A <p>, not a heading: each page renders its own <h1>. */}
      <p className={styles.title}>{title}</p>
      <div className={styles.actions}>
        <BackendStatus status={backendStatus} />
        <ThemeToggle />
      </div>
    </header>
  )
}
