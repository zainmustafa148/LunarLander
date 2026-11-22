import { useEffect, useRef, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { APP_NAME, getPageTitle } from '../../app/navigation.js'
import { useBackendHealth } from '../../hooks/useBackendHealth.js'
import { useMediaQuery } from '../../hooks/useMediaQuery.js'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import styles from './AppShell.module.css'

export default function AppShell() {
  const { pathname } = useLocation()
  const title = getPageTitle(pathname)
  const { status: backendStatus } = useBackendHealth()

  const isMobile = useMediaQuery('(max-width: 639.98px)')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [railExpanded, setRailExpanded] = useState(false)
  // The drawer only exists on mobile; resizing to a larger screen simply ignores the flag.
  const drawerActive = isMobile && drawerOpen

  const menuButtonRef = useRef(null)
  const wasDrawerActive = useRef(false)

  useEffect(() => {
    document.title = `${title} · ${APP_NAME}`
  }, [title])

  // While the drawer is open: Escape closes it and the page behind does not scroll.
  useEffect(() => {
    if (!drawerActive) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [drawerActive])

  // Return focus to the menu button after the drawer closes.
  useEffect(() => {
    if (wasDrawerActive.current && !drawerActive) menuButtonRef.current?.focus()
    wasDrawerActive.current = drawerActive
  }, [drawerActive])

  const closeNavigation = () => {
    setDrawerOpen(false)
    setRailExpanded(false)
  }

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar
        isMobile={isMobile}
        drawerOpen={drawerActive}
        railExpanded={railExpanded}
        onNavigate={closeNavigation}
        onClose={() => setDrawerOpen(false)}
        onToggleRail={() => setRailExpanded((expanded) => !expanded)}
      />

      {drawerActive && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation"
          tabIndex={-1}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* `inert` while the drawer is open keeps keyboard focus inside the drawer. */}
      <div className={styles.content} inert={drawerActive}>
        <Topbar
          title={title}
          backendStatus={backendStatus}
          menuOpen={drawerActive}
          onMenuClick={() => setDrawerOpen(true)}
          menuButtonRef={menuButtonRef}
        />
        <main id="main-content" className={styles.main} tabIndex={-1}>
          <div key={pathname} className={styles.container}>
            <Outlet />
          </div>
        </main>
      </div>

      <ScrollRestoration />
    </div>
  )
}
