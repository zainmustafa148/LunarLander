import { useEffect, useState } from 'react'
import { BACKEND_CONFIGURED } from '../config/env.js'
import { getHealth } from '../services/health.js'

const POLL_MS = 30000

/*
 * Backend status for the topbar and the simulation page:
 *   not-configured  VITE_API_BASE_URL is empty: no request is made (the default today)
 *   checking        the first GET /api/health is in flight
 *   connected       the last health check succeeded
 *   not-connected   the last health check failed
 * Nothing is simulated: without a configured backend the status stays "not-configured".
 */
export function useBackendHealth() {
  const [status, setStatus] = useState(BACKEND_CONFIGURED ? 'checking' : 'not-configured')

  useEffect(() => {
    if (!BACKEND_CONFIGURED) return undefined
    const controller = new AbortController()
    const check = async () => {
      try {
        await getHealth(undefined, { signal: controller.signal })
        setStatus('connected')
      } catch {
        if (!controller.signal.aborted) setStatus('not-connected')
      }
    }
    check()
    const timer = setInterval(check, POLL_MS)
    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [])

  return { status }
}
