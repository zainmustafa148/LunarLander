import Badge from '../../components/ui/Badge.jsx'
import Callout from '../../components/ui/Callout.jsx'
import Card from '../../components/ui/Card.jsx'
import { CAVEAT, FINDINGS, LIMITATIONS } from '../../data/overview.js'
import { MODELS } from '../../data/models.js'
import { EVALUATION, RANKING } from '../../data/results.js'
import { formatNumber } from '../../utils/format.js'
import styles from './FindingsSection.module.css'

export default function FindingsSection() {
  return (
    <>
      <Card as="div" className={styles.ranking}>
        <h3 className={styles.rankingTitle}>Ranking by mean original reward</h3>
        <ol className={styles.rankingList}>
          {RANKING.map((id) => (
            <li key={id}>
              <span className={styles.rankName}>{MODELS[id].name}</span>
              <span className={styles.rankValue}>{formatNumber(EVALUATION[id].meanReward)}</span>
            </li>
          ))}
        </ol>
      </Card>

      <ul className={styles.list}>
        {FINDINGS.map((finding) => (
          <li key={finding.id}>
            <Card as="article" className={styles.card}>
              <Badge tone={finding.tone}>{finding.label}</Badge>
              <h3 className={styles.title}>{finding.title}</h3>
              <p className={styles.detail}>{finding.detail}</p>
            </Card>
          </li>
        ))}
      </ul>

      <Callout tone="warning" title="Interpret with care">
        <p>{CAVEAT}</p>
        <details className={styles.details}>
          <summary>All limitations listed in the report</summary>
          <ol className={styles.limitations}>
            {LIMITATIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </details>
      </Callout>
    </>
  )
}
