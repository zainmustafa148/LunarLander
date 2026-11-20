import { useRef } from 'react'
import clsx from 'clsx'
import styles from './Tabs.module.css'

const tabId = (prefix, id) => `${prefix}-tab-${id}`
const panelId = (prefix, id) => `${prefix}-panel-${id}`

/*
 * Accessible tabs (WAI-ARIA tabs pattern, automatic activation).
 * Controlled: the parent owns `value` and `onChange`. Pair with <TabPanel> using the same idPrefix.
 * tabs: [{ id, label }]    Keys: Left/Right (wrapping), Home, End.
 */
export default function Tabs({ label, idPrefix, tabs, value, onChange }) {
  const buttons = useRef([])

  function handleKeyDown(event, index) {
    const last = tabs.length - 1
    let next = null
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    if (next === null) return
    event.preventDefault()
    onChange(tabs[next].id)
    buttons.current[next]?.focus()
  }

  return (
    <div className={styles.list} role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            ref={(node) => {
              buttons.current[index] = node
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, tab.id)}
            aria-selected={selected}
            aria-controls={panelId(idPrefix, tab.id)}
            tabIndex={selected ? 0 : -1}
            className={clsx(styles.tab, selected && styles.selected)}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

// Renders its children only while its tab is selected, so inactive panels load nothing.
export function TabPanel({ idPrefix, id, value, children }) {
  if (id !== value) return null
  return (
    <div role="tabpanel" id={panelId(idPrefix, id)} aria-labelledby={tabId(idPrefix, id)} tabIndex={0} className={styles.panel}>
      {children}
    </div>
  )
}
