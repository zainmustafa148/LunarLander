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
import { classifyOutcome, isNumber } from '../../utils/series.js'
import { summarize } from '../../utils/dataStore.js'
import s from '../shared/shared.module.css'
import styles from './hacking.module.css'

const IDS = ['badEvalCustom']
const COLUMNS = ['episode', 'seed', 'custom_reward', 'original_reward', 'length', 'outcome_original_rule', 'terminated', 'truncated']

const range = (values) => (values.length ? `${formatNumber(Math.min(...values))} to ${formatNumber(Math.max(...values))}` : 'no values')

// The ten Bad Reward evaluation episodes, with the custom reward and the original reward kept in
// two separate charts and two separate table columns.
export default function BadRewardEvidence() {
  const entries = useDatasets(IDS)
  const state = summarize(entries, IDS)
  const table = entries.badEvalCustom.status === 'ready' ? entries.badEvalCustom.table : null
  const rows = useMemo(
    () => (table ? toObjects(table, COLUMNS).map((row) => ({ ...row, outcome: classifyOutcome(row.outcome_original_rule).label })) : []),
    [table],
  )

  if (state.status !== 'ready') {
    return <DataState status={state.status} title="Bad Reward evaluation episodes" problems={state.problems} onRetry={state.status === 'error' ? () => reloadDatasets(IDS) : undefined} />
  }

  const custom = rows.map((r) => r.custom_reward).filter(isNumber)
  const original = rows.map((r) => r.original_reward).filter(isNumber)
  const lengths = rows.map((r) => r.length).filter(isNumber)
  const timeouts = rows.filter((r) => r.outcome === 'Timeout').length
  const fmt = (v) => (isNumber(v) ? formatNumber(v) : '—')

  return (
    <div className={s.stackLg}>
      <div className={styles.pair}>
        <div>
          <p className={styles.kind}>
            <Badge tone="warning">Custom reward R_bad</Badge>
          </p>
          <SimpleEpisodeChart
            data={rows.map((r) => ({ episode: r.episode, outcome: r.outcome, custom: r.custom_reward }))}
            series={[{ key: 'custom', label: 'Custom reward (R_bad)', colorKey: 'modelBadReward' }]}
            title="Reward under the flawed objective"
            subtitle="Per evaluation episode, measured by the survival-based wrapper."
            summary={`Custom reward per episode, ${rows.length} episodes, ${range(custom)}.`}
            footnote="Only meaningful under R_bad. It is not a landing metric."
          />
        </div>
        <div>
          <p className={styles.kind}>
            <Badge tone="primary">Original environment reward</Badge>
          </p>
          <SimpleEpisodeChart
            data={rows.map((r) => ({ episode: r.episode, outcome: r.outcome, original: r.original_reward }))}
            series={[{ key: 'original', label: 'Original reward', colorKey: 'modelBadReward' }]}
            title="Reward in the original environment"
            subtitle="The same episodes, scored with the original reward."
            summary={`Original reward per episode, ${rows.length} episodes, ${range(original)}.`}
            footnote="Original environment reward, the metric used for every model comparison."
          />
        </div>
      </div>
      <Callout title="What the numbers say">
        In these {rows.length} episodes the custom reward ranged {range(custom)} while the original reward ranged {range(original)}. {timeouts} of {rows.length} episodes were timeouts, with lengths {range(lengths)} steps. The two rewards describe the same episodes but are different quantities and are never added or compared as one scale.
      </Callout>
      <details className={s.details}>
        <summary>View every episode as a table</summary>
        <DataTable
          caption="Bad Reward PPO evaluation episodes with custom and original reward"
          labelHeader="Episode"
          columns={[
            { id: 'seed', header: 'Seed' },
            { id: 'length', header: 'Length' },
            { id: 'outcome', header: 'Outcome (original rule)' },
            { id: 'custom', header: 'Custom reward' },
            { id: 'original', header: 'Original reward' },
          ]}
          rows={rows.map((r) => ({
            id: r.episode,
            label: `Episode ${r.episode}`,
            cells: { seed: r.seed, length: fmt(r.length), outcome: r.outcome, custom: fmt(r.custom_reward), original: fmt(r.original_reward) },
          }))}
        />
      </details>
      <p className={`${s.small} ${s.muted}`}>Source: {DATASETS.badEvalCustom.source}.</p>
    </div>
  )
}
