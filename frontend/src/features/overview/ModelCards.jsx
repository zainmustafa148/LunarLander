import Badge from '../../components/ui/Badge.jsx'
import Card from '../../components/ui/Card.jsx'
import { MODEL_IDS, MODELS } from '../../data/models.js'
import { CUSTOM_REWARDS, EVALUATION } from '../../data/results.js'
import { formatNumber } from '../../utils/format.js'
import styles from './ModelCards.module.css'

export default function ModelCards() {
  return (
    <ul className={styles.grid}>
      {MODEL_IDS.map((id) => {
        const model = MODELS[id]
        const result = EVALUATION[id]
        const custom = CUSTOM_REWARDS[id]
        return (
          <li key={id} className={styles.item}>
            <Card as="article" className={styles.card} style={{ '--model-color': `var(${model.colorVar})` }}>
              <div className={styles.top}>
                <h3 className={styles.name}>
                  <span className={styles.swatch} aria-hidden="true" />
                  {model.name}
                </h3>
                <Badge tone={model.badgeTone}>{model.role}</Badge>
              </div>
              <p className={styles.summary}>{model.summary}</p>
              <dl className={styles.meta}>
                <div>
                  <dt>Training reward</dt>
                  <dd>{model.trainingReward}</dd>
                </div>
                <div>
                  <dt>Model file</dt>
                  <dd>
                    <code>{model.modelFile}</code>
                  </dd>
                </div>
              </dl>
              <dl className={styles.stats} aria-label={`${model.name} evaluation results (original reward)`}>
                <div>
                  <dt>Mean original reward</dt>
                  <dd>{formatNumber(result.meanReward)}</dd>
                </div>
                <div>
                  <dt>Landings</dt>
                  <dd>
                    {result.landed}/10
                  </dd>
                </div>
                <div>
                  <dt>Crashes · Timeouts</dt>
                  <dd>
                    {result.crashed} · {result.timeouts}
                  </dd>
                </div>
              </dl>
              {custom && (
                <p className={styles.custom}>
                  Under its own custom objective this agent earned a mean of {custom.mean}. That figure is not
                  comparable with the original rewards above.
                </p>
              )}
            </Card>
          </li>
        )
      })}
    </ul>
  )
}
