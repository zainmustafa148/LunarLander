import clsx from 'clsx'
import { PanelLeftClose, PanelLeftOpen, Rocket, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { APP_NAME, NAV_ITEMS } from '../../app/navigation.js'
import IconButton from '../ui/IconButton.jsx'
import styles from './Sidebar.module.css'

/*
 * One component, three behaviours (see Sidebar.module.css):
 *  - desktop >= 1024px: fixed, full width with labels
 *  - tablet 640-1023px: icon rail; `railExpanded` temporarily overlays the full sidebar
 *  - mobile < 640px: off-canvas drawer controlled by `drawerOpen`
 */
export default function Sidebar({ isMobile, drawerOpen, railExpanded, onNavigate, onClose, onToggleRail }) {
  const closeButtonRef = useRef(null)

  // Move focus into the drawer when it opens.
  useEffect(() => {
    if (isMobile && drawerOpen) closeButtonRef.current?.focus()
  }, [isMobile, drawerOpen])

  return (
    <aside
      id="primary-navigation"
      className={clsx(styles.sidebar, drawerOpen && styles.open, railExpanded && styles.expanded)}
      // A closed drawer is removed from tab order and the accessibility tree.
      inert={isMobile && !drawerOpen}
    >
      <div className={styles.header}>
        <NavLink to="/" className={styles.brand} onClick={onNavigate} aria-label={`${APP_NAME}, go to Overview`}>
          <span className={styles.mark}>
            <Rocket size={20} aria-hidden="true" />
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>{APP_NAME}</span>
            <span className={styles.brandTagline}>PPO · Reward shaping</span>
          </span>
        </NavLink>
        <IconButton ref={closeButtonRef} icon={X} label="Close navigation" className={styles.closeButton} onClick={onClose} />
      </div>

      <nav className={styles.nav} aria-label="Main">
        <ul className={styles.list}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                title={label}
                className={({ isActive }) => clsx(styles.link, isActive && styles.active)}
                onClick={onNavigate}
              >
                <Icon size={20} aria-hidden="true" className={styles.linkIcon} />
                <span className={styles.label}>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <p className={styles.footerNote}>Real results only. Missing data is shown as unavailable, never simulated.</p>
        <IconButton
          icon={railExpanded ? PanelLeftClose : PanelLeftOpen}
          label={railExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className={styles.railToggle}
          onClick={onToggleRail}
          aria-expanded={railExpanded}
        />
      </div>
    </aside>
  )
}
