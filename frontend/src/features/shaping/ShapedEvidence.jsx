import { useMemo } from 'react'
import SimpleEpisodeChart from '../../components/charts/SimpleEpisodeChart.jsx'
import DataState from '../../components/feedback/DataState.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Callout from '../../components/ui/Callout.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { DATASETS } from '../../data/datasets.js'
import { reloadDatasets, useDatasets } from '../../hooks/useDatasets.js'
import { formatNumber } from '../../utils/format.js'
import { toObjects } from '../../utils/rows.js'
import { summarize } from '../../utils/dataStore.js'
import { classifyOutcome, isNumber } from '../../utils/series.js'
import s from '../shared/shared.module.css'
import styles from '../hacking/hacking.module.css'

const IDS = ['improvedEvalImproved']
const COLUMNS = ['episode', 'seed', 'improved_reward', 'original_reward', 'shaping_return', 'length', 'outcome']
const fmt = (v) => (isNumber(v) ? formatNumber(v) : '—')

// Per-episode evaluation in the shaped environment: shaped reward = original reward + shaping return.
// The original reward and the shaping return are drawn in separate charts, never on one axis.
export default function ShapedEvidence() {
  const entries = useDatasets(IDS)
  const state = summarize(entries, IDS)
  const table = entries.improvedEvalImproved.status === 'ready' ? entries.improvedEvalImproved.table : null
  const rows = useMemo(() => (table ? toObjects(table, COLUMNS).map((r) => ({ ...r, outcomeLabel: classifyOutcome(r.outcome).label })) : []), [table])

  if (state.status !== 'ready') {
    return <DataState status={state.status} title="Improved Reward evaluation in the shaped environment" problems={state.problems} onRetry={state.status === 'error' ? () => reloadDatasets(IDS) : undefined} />
  }

  const gaps = rows.map((r) => Math.abs(r.improved_reward - (r.original_reward + r.shaping_return))).filter(isNumber)
  const maxGap = gaps.length ? Math.max(...gaps) : null
  const shaping = rows.map((r) => r.shaping_return).filter(isNumber)

  return (
    <div className={s.stackLg}>
      <div className={styles.pair}>
        <div>
          <p className={styles.kind}><Badge tone="primary">Original environment reward</Badge></p>
          <SimpleEpisodeChart
            data={rows.map((r) => ({ episode: r.episode, outcome: r.outcomeLabel, original: r.original_reward }))}
            series={[{ key: 'original', label: 'Original reward', colorKey: 'modelImproved' }]}
            title="Original reward per episode"
            subtitle="Improved Reward PPO, scored with the original reward."
            summary={`Original reward of ${rows.length} Improved Reward episodes.`}
            footnote="The metric used for every model comparison."
          />
        </div>
        <div>
          <p className={styles.kind}><Badge tone="accent">Shaping term</Badge></p>
          <SimpleEpisodeChart
            data={rows.map((r) => ({ episode: r.episode, outcome: r.outcomeLabel, shaping: r.shaping_return }))}
            series={[{ key: 'shaping', label: 'Shaping return (α · ΣF)', colorKey: 'modelImproved' }]}
            title="Shaping contribution per episode"
            subtitle="What the potential-based term added over each episode."
            summary={`Shaping return of ${rows.length} episodes, from ${shaping.length ? formatNumber(Math.min(...shaping)) : '—'} to ${shaping.length ? formatNumber(Math.max(...shaping)) : '—'}.`}
            footnote="Already includes α = 10. Not a landing metric."
          />
        </div>
      </div>
      <Callout title="How the two relate">
        In the shaped environment each episode&apos;s improved reward is the original reward plus the shaping return. In this data file the largest difference between improved reward and original plus shaping is {maxGap === null ? '—' : formatNumber(maxGap, 6)}. The improved reward is the training objective; only the original reward is used to judge the model.
      </Callout>
      <details className={s.details}>
        <summary>View every episode as a table</summary>
        <DataTable
          caption="Improved Reward PPO evaluation in the shaped environment"
          labelHeader="Episode"
          columns={[
            { id: 'outcome', header: 'Outcome' },
            { id: 'original', header: 'Original reward' },
            { id: 'shaping', header: 'Shaping return' },
            { id: 'improved', header: 'Improved reward' },
          ]}
          rows={rows.map((r) => ({ id: r.episode, label: `Episode ${r.episode} (seed ${r.seed})`, cells: { outcome: r.outcomeLabel, original: fmt(r.original_reward), shaping: fmt(r.shaping_return), improved: fmt(r.improved_reward) } }))}
        />
      </details>
      <p className={`${s.small} ${s.muted}`}>Source: {DATASETS.improvedEvalImproved.source}.</p>
    </div>
  )
}
