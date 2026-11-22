import { ExternalLink } from 'lucide-react'
import styles from './Media.module.css'

// A research figure with explicit dimensions (no layout shift), lazy loading, a text alternative
// and a link to the full-size file.
export default function FigureImage({ figure, maxWidth }) {
  return (
    <figure className={styles.figure} style={maxWidth ? { maxWidth } : undefined}>
      <a href={figure.src} target="_blank" rel="noopener noreferrer" className={styles.imageLink}>
        <img className={styles.image} src={figure.src} width={figure.width} height={figure.height} alt={figure.alt} loading="lazy" decoding="async" />
        <span className="visually-hidden"> (open the full-size image in a new tab)</span>
      </a>
      <figcaption className={styles.caption}>
        <strong>{figure.title}.</strong> <span className={styles.source}>Source: {figure.source}</span>
        {figure.repoUrl && (
          <>
            {' '}
            <a href={figure.repoUrl} target="_blank" rel="noopener noreferrer">
              Repository file
              <ExternalLink size={12} aria-hidden="true" className={styles.ext} />
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </>
        )}
      </figcaption>
    </figure>
  )
}
