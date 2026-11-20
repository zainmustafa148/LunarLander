import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card.jsx'
import { EXPERIMENTS, SHARED_CONFIG } from '../../data/overview.js'
import { MODELS } from '../../data/models.js'
import styles from './ExperimentsSection.module.css'

export default function ExperimentsSection() {
  return (
    <>
      <Card as="div" className={styles.shared}>
        <h3 className={styles.sharedTitle}>Identical across all three experiments</h3>
        <p className={styles.sharedText}>The reward is the only experimental difference.</p>
        <dl className={styles.config}>
          {SHARED_CONFIG.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <ol className={styles.list}>
        {EXPERIMENTS.map((experiment) => {
          const model = MODELS[experiment.modelId]
          const headingId = `experiment-${experiment.id}`
          return (
            <li key={experiment.id}>
              <Card
                as="article"
                className={styles.card}
                aria-labelledby={headingId}
                style={{ '--model-color': `var(${model.colorVar})` }}
              >
                <p className={styles.kicker}>
                  Experiment {experiment.number} · {model.name}
                </p>
                <h3 id={headingId} className={styles.title}>
                  {experiment.title}
                </h3>
                <p className={styles.question}>{experiment.question}</p>

                {experiment.hypothesis && <blockquote className={styles.quote}>{experiment.hypothesis}</blockquote>}
                {experiment.formula && <p className={styles.formula}>{experiment.formula}</p>}

                <h4 className={styles.label}>{experiment.setupTitle ?? 'Setup'}</h4>
                <ul className={styles.bullets}>
                  {experiment.setup.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                {experiment.illustration && <p className={styles.note}>{experiment.illustration}</p>}

                <h4 className={styles.label}>Outcome (original reward, 10 episodes)</h4>
                <p>{experiment.outcome}</p>
                {experiment.caveat && <p className={clsx(styles.note, styles.caveat)}>{experiment.caveat}</p>}

                <Link to={experiment.to} className={styles.link}>
                  {experiment.id === 'baseline' ? 'Model Explorer' : `${experiment.title} page`}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Card>
            </li>
          )
        })}
      </ol>
    </>
  )
}
