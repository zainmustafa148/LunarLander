import DataTable from '../../components/ui/DataTable.jsx'
import OutcomeChart from '../../components/charts/OutcomeChart.jsx'
import RewardChart from '../../components/charts/RewardChart.jsx'
import Callout from '../../components/ui/Callout.jsx'
import { PROJECT } from '../../data/overview.js'
import { MODEL_IDS, MODELS } from '../../data/models.js'
import { DIFFERENCES, EVALUATION, PROTOCOL } from '../../data/results.js'
import { SOURCES } from '../../data/sources.js'
import { formatNumber, formatSigned } from '../../utils/format.js'
import styles from './PerformanceSection.module.css'

const modelColumns = MODEL_IDS.map((id) => ({
  id,
  header: (
    <span className={styles.columnHeader}>
      <span className={styles.dot} style={{ background: `var(${MODELS[id].colorVar})` }} aria-hidden="true" />
      {MODELS[id].name}
    </span>
  ),
}))

const metricRows = [
  { id: 'mean', label: 'Mean original reward', format: (r) => formatNumber(r.meanReward) },
  { id: 'std', label: 'Standard deviation', format: (r) => formatNumber(r.std) },
  { id: 'length', label: 'Mean episode length (steps)', format: (r) => formatNumber(r.meanLength) },
  { id: 'landed', label: 'Successful landings', format: (r) => `${r.landed}/${PROTOCOL.episodes}` },
  { id: 'crashed', label: 'Crashes', format: (r) => String(r.crashed) },
  { id: 'timeouts', label: 'Timeouts', format: (r) => String(r.timeouts) },
].map((metric) => ({
  id: metric.id,
  label: metric.label,
  cells: Object.fromEntries(MODEL_IDS.map((id) => [id, metric.format(EVALUATION[id])])),
}))

const differenceColumns = [
  { id: 'reward', header: 'Δ mean original reward' },
  { id: 'length', header: 'Δ mean length (steps)' },
  { id: 'landings', header: 'Δ landings' },
]

const differenceRows = DIFFERENCES.map((d) => ({
  id: d.id,
  label: d.label,
  cells: {
    reward: formatSigned(d.reward),
    length: formatSigned(d.length),
    landings: formatSigned(d.landings, 0),
  },
}))

export default function PerformanceSection() {
  return (
    <>
      <Callout title="Evaluation protocol">
        <p>
          Each model was evaluated in the {PROTOCOL.environment} for {PROTOCOL.episodes} episodes with seeds{' '}
          {PROTOCOL.seeds} and {PROTOCOL.actions} actions. Every number below is the <strong>original environment
          reward</strong>, never a shaped or custom reward.
        </p>
        <ul className={styles.rules}>
          {PROJECT.landingRule.map((item) => (
            <li key={item.outcome}>
              <strong>{item.outcome}:</strong> {item.rule}
            </li>
          ))}
        </ul>
      </Callout>

      <div className={styles.charts}>
        <RewardChart />
        <OutcomeChart />
      </div>

      <h3 className={styles.tableTitle}>Results table</h3>
      <DataTable
        caption="Comparison of the three PPO models on the original environment reward"
        columns={modelColumns}
        rows={metricRows}
      />
      <p className={styles.source}>
        Standard deviation is taken across the 10 episode rewards. Source: project report, Table 9 (
        <code>{SOURCES.summaryCsv}</code>).
      </p>

      <h3 className={styles.tableTitle}>Differences between models</h3>
      <DataTable
        caption="Differences between models, second minus first"
        labelHeader="Comparison"
        columns={differenceColumns}
        rows={differenceRows}
      />
      <p className={styles.source}>Computed from the results table above (report Table 10): second model minus first.</p>
    </>
  )
}
