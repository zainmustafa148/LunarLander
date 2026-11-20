import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'
import {
  getSystemTheme,
  readStoredTheme,
  writeStoredTheme,
} from './themeStorage'

export function ThemeProvider({ children }) {
  // Saved choice wins; otherwise follow the OS preference.
  const [theme, setThemeState] = useState(() => readStoredTheme() ?? getSystemTheme())

  // Keep <html data-theme> in sync (the inline script in index.html sets it before first paint).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // While the user has not made an explicit choice, follow live OS changes.
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (readStoredTheme() === null) {
        setThemeState(query.matches ? 'dark' : 'light')
      }
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next) => {
    writeStoredTheme(next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
