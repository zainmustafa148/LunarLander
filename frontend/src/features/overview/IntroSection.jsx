import { ExternalLink } from 'lucide-react'
import Callout from '../../components/ui/Callout.jsx'
import Card from '../../components/ui/Card.jsx'
import { PROJECT } from '../../data/overview.js'
import { AUTHOR, SOURCES } from '../../data/sources.js'
import styles from './IntroSection.module.css'

export default function IntroSection() {
  return (
    <section className={styles.intro} aria-labelledby="intro-heading">
      <p className={styles.eyebrow}>{PROJECT.eyebrow}</p>
      <h1 id="intro-heading" className={styles.title}>
        {PROJECT.title}
      </h1>
      <p className={styles.subtitle}>{PROJECT.subtitle}</p>
      <p className={styles.byline}>
        By {AUTHOR} ·{' '}
        <a href={SOURCES.repoUrl} target="_blank" rel="noopener noreferrer">
          GitHub repository
          <ExternalLink size={14} aria-hidden="true" className={styles.external} />
          <span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      </p>

      <dl className={styles.facts}>
        {PROJECT.facts.map((fact) => (
          <div key={fact.label} className={styles.fact}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.columns}>
        <div>
          <h2 className={styles.heading}>Introduction</h2>
          {PROJECT.introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <h3 className={styles.subheading}>Research question</h3>
          <blockquote className={styles.question}>{PROJECT.researchQuestion}</blockquote>
        </div>

        <Card as="div">
          <h2 className={styles.heading}>Research objectives</h2>
          <ol className={styles.objectives}>
            {PROJECT.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
        </Card>
      </div>

      <Callout title="Original reward versus custom reward">
        <p>{PROJECT.principle}</p>
      </Callout>
    </section>
  )
}
