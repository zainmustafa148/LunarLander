import { useId, useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CSV_MODEL_IDS, DATASETS, EPISODE_DATASETS } from '../../data/datasets.js'
import { MODEL_IDS, MODELS } from '../../data/models.js'
import { reloadDatasets, useDatasets } from '../../hooks/useDatasets.js'
import { useChartTheme } from '../../hooks/useChartTheme.js'
import { formatNumber } from '../../utils/format.js'
import { summarize } from '../../utils/dataStore.js'
import { classifyOutcome, getColumn, isNumber } from '../../utils/series.js'
import DataState from '../feedback/DataState.jsx'
import Callout from '../ui/Callout.jsx'
import DataTable from '../ui/DataTable.jsx'
import ChartCard from './ChartCard.jsx'
import ChartTooltip from './ChartTooltip.jsx'
import { AXIS_FONT_SIZE, MODEL_COLOR_KEYS } from './chartStyle.js'
import styles from './EpisodeCharts.module.css'

// Evaluation episodes are cut off at 1,000 steps (truncated = True in the evaluation logs).
const STEP_LIMIT = 1000

const formatReward = (value) => (isNumber(value) ? formatNumber(value, 1) : '—')
const formatLength = (value) => (isNumber(value) ? formatNumber(value, 0) : '—')

// One row per episode: { episode, baseline, badReward, improved, meta }, where each model key holds
// the metric and meta[model] keeps the full record for tooltips and the table. Values are copied
// from the data file as they are; rows with an unknown model name are ignored.
function buildEpisodes(table, metric) {
  const model = getColumn(table, 'model')
  const episode = getColumn(table, 'episode')
  const reward = getColumn(table, 'original_reward')
  const length = getColumn(table, 'length')
  const outcome = getColumn(table, 'outcome')
  const byEpisode = new Map()
  model.forEach((name, i) => {
    const id = CSV_MODEL_IDS[name]
    if (!id || !isNumber(episode[i])) return
    const row = byEpisode.get(episode[i]) ?? { episode: episode[i], meta: {} }
    const record = { reward: reward[i], length: length[i], raw: outcome[i], outcome: classifyOutcome(outcome[i]) }
    row[id] = record[metric]
    row.meta[id] = record
    byEpisode.set(episode[i], row)
  })
  return [...byEpisode.values()].sort((a, b) => a.episode - b.episode)
}

function EpisodeTooltip({ active, label, rowsByEpisode, present, colors, metric, format }) {
  if (!active) return null
  const row = rowsByEpisode.get(label)
  if (!row) return null
  const items = present
    .filter((id) => row.meta[id])
    .map((id) => {
      const record = row.meta[id]
      const logged = record.raw && record.raw !== record.outcome.label ? ` (logged as ${record.raw})` : ''
      return {
        key: id,
        color: colors[MODEL_COLOR_KEYS[id]],
        label: MODELS[id].shortName,
        value: format(record[metric]),
        detail: `${record.outcome.label}${logged}`,
      }
    })
  return <ChartTooltip title={`Episode ${label}`} rows={items} />
}

function EpisodeBarChart({ metric, title, subtitle, footnote, format, referenceLine }) {
  const colors = useChartTheme()
  const entries = useDatasets(EPISODE_DATASETS)
  const state = summarize(entries, EPISODE_DATASETS)
  const entry = entries.evalPerEpisode
  const table = entry.status === 'ready' ? entry.table : null
  const episodes = useMemo(() => (table ? buildEpisodes(table, metric) : []), [table, metric])
  const patternPrefix = `episode-${useId().replace(/:/g, '')}`

  if (state.status !== 'ready') {
    const retry = state.status === 'error' ? () => reloadDatasets(EPISODE_DATASETS) : undefined
    return <DataState status={state.status} title={title} problems={state.problems} onRetry={retry} />
  }

  const present = MODEL_IDS.filter((id) => episodes.some((row) => isNumber(row[id])))
  if (present.length === 0) {
    const problems = [
      { id: 'evalPerEpisode', file: DATASETS.evalPerEpisode.file, reason: 'The file has no rows for Baseline PPO, Bad Reward PPO or Improved Reward PPO.' },
    ]
    return <DataState status="unavailable" title={title} problems={problems} />
  }
  const absent = MODEL_IDS.filter((id) => !present.includes(id))
  const rowsByEpisode = new Map(episodes.map((row) => [row.episode, row]))

  const summary =
    `${title}. ` +
    present
      .map((id) => {
        const values = episodes.map((row) => row[id]).filter(isNumber)
        const notLanded = episodes.filter((row) => row.meta[id] && row.meta[id].outcome.key !== 'landed').length
        return `${MODELS[id].name}: ${values.length} episodes from ${format(Math.min(...values))} to ${format(Math.max(...values))}, ${notLanded} without a landing.`
      })
      .join(' ')

  const tableColumns = present.map((id) => ({ id, header: MODELS[id].shortName }))
  const tableRows = episodes.map((row) => ({
    id: row.episode,
    label: `Episode ${row.episode}`,
    cells: Object.fromEntries(
      present.map((id) => [id, row.meta[id] ? `${format(row.meta[id][metric])} (${row.meta[id].outcome.label})` : '—']),
    ),
  }))

  return (
    <div className={styles.wrap}>
      <ChartCard title={title} subtitle={subtitle} summary={summary} footnote={footnote}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={episodes} margin={{ top: 8, right: 8, bottom: 20, left: 0 }}>
            <defs>
              {present.map((id) => (
                <pattern key={id} id={`${patternPrefix}-${id}`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill={colors.surface} />
                  <line x1="0" y1="0" x2="0" y2="6" stroke={colors[MODEL_COLOR_KEYS[id]]} strokeWidth="3" />
                </pattern>
              ))}
            </defs>
            <CartesianGrid stroke={colors.borderSubtle} vertical={false} />
            <XAxis
              dataKey="episode"
              tickLine={false}
              stroke={colors.border}
              tick={{ fill: colors.textMuted, fontSize: AXIS_FONT_SIZE }}
              label={{ value: 'Evaluation episode', position: 'insideBottom', offset: -12, fill: colors.textMuted, fontSize: AXIS_FONT_SIZE }}
            />
            <YAxis
              stroke={colors.border}
              tick={{ fill: colors.textMuted, fontSize: AXIS_FONT_SIZE }}
              tickFormatter={(value) => formatNumber(value, 0)}
              domain={referenceLine ? [0, (max) => Math.max(max, referenceLine.value) * 1.1] : ['auto', 'auto']}
              width={52}
            />
            {!referenceLine && <ReferenceLine y={0} stroke={colors.border} />}
            {referenceLine && (
              <ReferenceLine
                y={referenceLine.value}
                stroke={colors.textMuted}
                strokeDasharray="4 4"
                label={{ value: referenceLine.label, position: 'insideTopRight', fill: colors.textMuted, fontSize: AXIS_FONT_SIZE }}
              />
            )}
            <Tooltip
              isAnimationActive={false}
              cursor={{ fill: colors.borderSubtle, fillOpacity: 0.5 }}
              content={<EpisodeTooltip rowsByEpisode={rowsByEpisode} present={present} colors={colors} metric={metric} format={format} />}
            />
            <Legend verticalAlign="top" height={32} formatter={(value) => <span style={{ color: colors.text }}>{value}</span>} />
            {present.map((id) => {
              const color = colors[MODEL_COLOR_KEYS[id]]
              // Bars for episodes that did not land are hatched, so the outcome never relies on colour.
              const shape = (props) => {
                const datum = props.payload ?? props
                const landed = datum.meta?.[id]?.outcome.key === 'landed'
                return <Rectangle {...props} fill={landed ? color : `url(#${patternPrefix}-${id})`} />
              }
              return (
                <Bar
                  key={id}
                  dataKey={id}
                  name={MODELS[id].shortName}
                  fill={color}
                  stroke={color}
                  strokeWidth={1.5}
                  maxBarSize={26}
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={false}
                  shape={shape}
                />
              )
            })}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      {absent.length > 0 && (
        <Callout tone="warning" title="Some models are missing from this chart">
          The data file has no rows for {absent.map((id) => MODELS[id].name).join(', ')}, so they are not drawn.
        </Callout>
      )}
      <details className={styles.details}>
        <summary>View the values as a table</summary>
        <DataTable caption={`${title}, values by episode`} labelHeader="Episode" columns={tableColumns} rows={tableRows} />
      </details>
    </div>
  )
}

export function EpisodeRewardChart() {
  return (
    <EpisodeBarChart
      metric="reward"
      format={formatReward}
      title="Original reward per evaluation episode"
      subtitle="Each model's evaluation episodes in the original, unwrapped environment. Hatched bars did not end in a landing."
      footnote="Original environment reward only: custom and shaped training rewards are never used here. Timeout means the episode reached the step limit. The source logs label these episodes “TIMEOUT (hovering)”; this app reports them as timeouts and does not treat hovering as established behaviour."
    />
  )
}

export function EpisodeLengthChart() {
  return (
    <EpisodeBarChart
      metric="length"
      format={formatLength}
      referenceLine={{ value: STEP_LIMIT, label: '1,000-step limit' }}
      title="Episode length per evaluation episode"
      subtitle="Steps taken in each evaluation episode. Hatched bars did not end in a landing."
      footnote="A length equal to the 1,000-step limit means the episode was cut off there and is reported as a timeout. Lengths come from the original-environment evaluation."
    />
  )
}
