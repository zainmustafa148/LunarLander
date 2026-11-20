import { useMemo, useSyncExternalStore } from 'react'

// Charts draw inside SVG, so they need resolved colour values rather than CSS variables.
// This hook reads the current theme's tokens and updates when data-theme changes.
const TOKENS = [
  '--color-text',
  '--color-text-muted',
  '--color-border',
  '--color-border-subtle',
  '--color-surface',
  '--color-model-baseline',
  '--color-model-bad-reward',
  '--color-model-improved',
  '--color-success',
  '--color-warning',
  '--color-danger',
]

const toCamel = (token) =>
  token.replace('--color-', '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())

function subscribe(onChange) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

function getSnapshot() {
  const styles = getComputedStyle(document.documentElement)
  return TOKENS.map((token) => styles.getPropertyValue(token).trim()).join('|')
}

export function useChartTheme() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => '')
  return useMemo(() => {
    const values = snapshot.split('|')
    return Object.fromEntries(TOKENS.map((token, index) => [toCamel(token), values[index]]))
  }, [snapshot])
}
