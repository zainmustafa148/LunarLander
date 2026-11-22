import { useMemo } from 'react'
import DataState from '../../components/feedback/DataState.jsx'
import Callout from '../../components/ui/Callout.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { CSV_MODEL_IDS } from '../../data/datasets.js'
import { NOT_OUTPERFORM_FACTORS } from '../../data/research.js'
import { reloadDatasets, useDatasets } from '../../hooks/useDatasets.js'
import { formatNumber, formatSigned } from '../../utils/format.js'
import { toObjects } from '../../utils/rows.js'
import { summarize } from '../../utils/dataStore.js'
import { classifyOutcome, isNumber } from '../../utils/series.js'
import s from '../shared/shared.module.css'

const IDS = ['evalPerEpisode', 'progressBaseline', 'progressImproved']
const PROGRESS_COLUMNS = ['time/total_timesteps', 'rollout/ep_len_mean']

// Descriptive comparison of the two models seed by seed, computed from the evaluation data.
// It describes where the 30.3-point gap comes from. It does not explain why the model behaves so.
function compare(table) {
  const rows = toObjects(table, ['model', 'episode', 'seed', 'original_reward', 'length', 'outcome'])
  const pick = (name) => new Map(rows.filter((r) => CSV_MODEL_IDS[r.model] === name).map((r) => [r.episode, r]))
  const base = pick('baseline')
  const imp = pick('improved')
  const episodes = [...base.keys()].filter((e) => imp.has(e)).sort((a, b) => a - b)
  return episodes.map((episode) => {
    const b = base.get(episode)
    const i = imp.get(episode)
    return { episode, seed: b.seed, baseline: b.original_reward, improved: i.original_reward, diff: i.original_reward - b.original_reward, outcome: classifyOutcome(i.outcome), lengthDiff: i.length - b.length }
  })
}

function lastRow(entry) {
  if (entry.status !== 'ready') return null
  const rows = toObjects(entry.table, PROGRESS_COLUMNS)
  return rows.length ? rows[rows.length - 1] : null
}

export default function WhyNotOutperform() {
  const entries = useDatasets(IDS)
  const state = summarize(entries, IDS)
  const evalTable = entries.evalPerEpisode.status === 'ready' ? entries.evalPerEpisode.table : null
  const pairs = useMemo(() => (evalTable ? compare(evalTable) : []), [evalTable])

  if (state.status === 'loading' || state.status === 'error' || state.status === 'unavailable') {
    return <DataState status={state.status} title="Baseline versus Improved, episode by episode" problems={state.problems} onRetry={state.status === 'error' ? () => reloadDatasets(IDS) : undefined} />
  }

  const valid = pairs.filter((p) => isNumber(p.diff))
  const total = valid.reduce((sum, p) => sum + p.diff, 0)
  const crashed = valid.filter((p) => p.outcome.key === 'crashed')
  const crashTotal = crashed.reduce((sum, p) => sum + p.diff, 0)
  const restMean = valid.length > crashed.length ? (total - crashTotal) / (valid.length - crashed.length) : null
  const meanGap = valid.length ? total / valid.length : null
  const baseProgress = lastRow(entries.progressBaseline)
  const impProgress = lastRow(entries.progressImproved)

  return (
    <div className={s.stackLg}>
      <Callout title="What the report says">
        <p>
          Improved Reward PPO landed 9 of 10 times with a mean original reward of 230.2, which is 30.3 below the Baseline&apos;s 260.5. The report states that adding the shaping term did not improve on the original reward in this configuration, and lists possible factors that were <strong>not independently tested</strong>:
        </p>
        <ul className={s.list}>
          {NOT_OUTPERFORM_FACTORS.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
        <p>These are directions for future experiments, not findings. No other α, potential weights or training budget were tried.</p>
      </Callout>

      {valid.length > 0 && (
        <>
          <p className={s.cardText}>
            Comparing the two models on the same ten seeds (original reward, Improved minus Baseline): the mean difference is {formatSigned(meanGap)}.
            {crashed.length > 0 && total < 0 && crashTotal < 0 && (
              <>
                {' '}
                {crashed.length === 1 ? 'One episode' : `${crashed.length} episodes`} ended in a crash (seed {crashed.map((p) => p.seed).join(', ')}) and account for {formatNumber(Math.abs(crashTotal), 1)} of the {formatNumber(Math.abs(total), 1)} points by which Improved falls below Baseline when the ten differences are added up
                {restMean !== null && <>; over the other {valid.length - crashed.length} episodes the mean difference is {formatSigned(restMean)}</>}.
              </>
            )}{' '}
            This describes where the gap comes from in these ten episodes. With one run per model and ten episodes it does not show why the agent crashed, and it is not a significance test.
          </p>
          <DataTable
            caption="Baseline and Improved Reward original rewards on the same seeds"
            labelHeader="Episode (seed)"
            columns={[
              { id: 'baseline', header: 'Baseline' },
              { id: 'improved', header: 'Improved' },
              { id: 'diff', header: 'Improved − Baseline' },
              { id: 'outcome', header: 'Improved outcome' },
            ]}
            rows={valid.map((p) => ({ id: p.episode, label: `${p.episode} (${p.seed})`, cells: { baseline: formatNumber(p.baseline), improved: formatNumber(p.improved), diff: formatSigned(p.diff), outcome: p.outcome.label } }))}
          />
        </>
      )}

      {baseProgress && impProgress && isNumber(baseProgress['rollout/ep_len_mean']) && isNumber(impProgress['rollout/ep_len_mean']) && (
        <Callout title="A training-time observation, not analysed in the report">
          In the last logged rollout (timestep {formatNumber(baseProgress['time/total_timesteps'], 0)}), the mean training episode length was {formatNumber(baseProgress['rollout/ep_len_mean'], 2)} steps for the Baseline and {formatNumber(impProgress['rollout/ep_len_mean'], 2)} for Improved Reward PPO. These come from the training progress logs, where actions are sampled rather than deterministic, so they are not comparable with the evaluation lengths (377.6 and 411.7). The report does not analyse this difference and this page does not draw a conclusion from it.
        </Callout>
      )}
    </div>
  )
}
