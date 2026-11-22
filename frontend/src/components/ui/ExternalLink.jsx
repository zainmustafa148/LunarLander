import { ExternalLink as Icon } from 'lucide-react'

// Link that opens in a new tab and says so to screen readers.
export default function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <Icon size={13} aria-hidden="true" style={{ marginLeft: '0.2em', verticalAlign: '-0.1em' }} />
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}
