import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  AVERAGE_WINDOW,
  DATASETS,
  OBJECTIVE_SERIES,
  ORIGINAL_TRAINING_DATASETS,
  ORIGINAL_TRAINING_SERIES,
  REWARD_KINDS,
  assertRewardKinds,
} from '../../data/datasets.js'
import { MODELS } from '../../data/models.js'
import { useChartTheme } from '../../hooks/useChartTheme.js'
import { reloadDatasets, useDatasets } from '../../hooks/useDatasets.js'
import { summarize } from '../../utils/dataStore.js'
import { formatNumber } from '../../utils/format.js'
import { formatCount, formatSteps, getColumn, isNumber, lastIndexAtOrBefore, movingAverage } from '../../utils/series.js'
import DataState from '../feedback/DataState.jsx'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import Callout from '../ui/Callout.jsx'
import DataTable from '../ui/DataTable.jsx'
import ChartCard from './ChartCard.jsx'
import ChartTooltip from './ChartTooltip.jsx'
import { AXIS_FONT_SIZE, MODEL_COLOR_KEYS, MODEL_DASH } from './chartStyle.js'
import styles from './TrainingCurveChart.module.css'

// Reward kinds can never be mixed: the comparison chart accepts original reward only, and the
// objective charts accept the other kinds only (each one is drawn on its own).
assertRewardKinds(ORIGINAL_TRAINING_SERIES, [REWARD_KINDS.ORIGINAL], 'TrainingCurveChart')
Object.values(OBJECTIVE_SERIES).forEach((series) =>
  assertRewardKinds(series, [REWARD_KINDS.CUSTOM, REWARD_KINDS.SHAPED, REWARD_KINDS.SHAPING], 'ObjectiveCurveChart'),
)

const OBJECTIVE_DEFS = Object.fromEntries(Object.entries(OBJECTIVE_SERIES).map(([id, series]) => [id, [series]]))
const BADGE_TONES = { [REWARD_KINDS.CUSTOM]: 'warning', [REWARD_KINDS.SHAPED]: 'accent', [REWARD_KINDS.SHAPING]: 'neutral' }
const RECORDED_DASH = '10 3 2 3'

// Points of one series in log order, with the 50-episode average calculated from the same values.
// Blank or non-numeric cells become null and are never filled in.
function buildPoints(def, table) {
  const timesteps = getColumn(table, 'timesteps')
  const values = getColumn(table, def.column)
  const average = movingAverage(values, AVERAGE_WINDOW)
  const recorded = def.recorded ? getColumn(table, def.recorded.column) : []
  const points = []
  for (let i = 0; i < timesteps.length; i += 1) {
    if (!isNumber(timesteps[i])) continue
    points.push({
      t: timesteps[i],
      episode: i + 1,
      raw: isNumber(values[i]) ? values[i] : null,
      avg: average[i],
      recorded: isNumber(recorded[i]) ? recorded[i] : null,
    })
  }
  return points.sort((a, b) => a.t - b.t)
}

const latest = (points, key) => {
  for (let i = points.length - 1; i >= 0; i -= 1) if (points[i][key] !== null) return points[i][key]
  return null
}

function CurveTooltip({ active, label, payload, lookups, showRaw, showRecorded }) {
  if (!active) return null
  const x = typeof label === 'number' ? label : payload?.[0]?.payload?.t
  if (!isNumber(x)) return null
  const rows = lookups
    .map(({ def, name, color, times, points }) => {
      const index = lastIndexAtOrBefore(times, x)
      if (index < 0) return null
      const point = points[index]
      const parts = [`Episode ${point.episode} in the log`]
      if (showRaw && point.raw !== null) parts.push(`raw ${formatNumber(point.raw, 1)}`)
      if (showRecorded && def.recorded && point.recorded !== null) parts.push(`recorded 100-episode average ${formatNumber(point.recorded, 1)}`)
      return {
        key: def.id,
        color,
        label: `${name}, ${AVERAGE_WINDOW}-episode average`,
        value: point.avg === null ? 'not available yet' : formatNumber(point.avg, 1),
        detail: parts.join(', '),
      }
    })
    .filter(Boolean)
  if (rows.length === 0) return null
  return <ChartTooltip title={`${formatCount(x)} timesteps`} rows={rows} />
}

function LineSample({ color, dash }) {
  return (
    <svg width="24" height="8" aria-hidden="true" focusable="false">
      <line x1="0" y1="4" x2="24" y2="4" stroke={color} strokeWidth="3" strokeDasharray={dash} />
    </svg>
  )
}

function CurveChart({ title, badge, badgeTone, subtitle, footnote, defs, datasetIds }) {
  const colors = useChartTheme()
  const entries = useDatasets(datasetIds)
  const state = summarize(entries, datasetIds)
  const [hidden, setHidden] = useState({})
  const [showRaw, setShowRaw] = useState(true)
  const [showRecorded, setShowRecorded] = useState(false)

  const built = useMemo(
    () => defs.filter((def) => entries[def.dataset].status === 'ready').map((def) => ({ def, points: buildPoints(def, entries[def.dataset].table) })),
    [defs, entries],
  )
  const { visible, rows } = useMemo(() => {
    const shown = built.filter(({ def }) => !hidden[def.id])
    const merged = []
    shown.forEach(({ def, points }) =>
      points.forEach((point) => {
        const row = { t: point.t, [`${def.id}Raw`]: point.raw, [`${def.id}Avg`]: point.avg }
        if (def.recorded) row[`${def.id}Rec`] = point.recorded
        merged.push(row)
      }),
    )
    return { visible: shown, rows: merged.sort((a, b) => a.t - b.t) }
  }, [built, hidden])

  if (state.status === 'loading' || state.status === 'unavailable' || state.status === 'error') {
    const retry = state.status === 'error' ? () => reloadDatasets(datasetIds) : undefined
    return <DataState status={state.status} title={title} problems={state.problems} onRetry={retry} />
  }

  const hasRecorded = built.some(({ def }) => def.recorded)
  const colorOf = (def) => colors[MODEL_COLOR_KEYS[def.modelId]]
  const lookups = visible.map(({ def, points }) => ({
    def,
    name: MODELS[def.modelId].name,
    color: colorOf(def),
    times: points.map((point) => point.t),
    points,
  }))
  const heading = badge ? (
    <span className={styles.heading}>
      {title} <Badge tone={badgeTone}>{badge}</Badge>
    </span>
  ) : (
    title
  )
  const summary =
    `${title}. ` +
    (visible.length === 0
      ? 'All series are hidden.'
      : visible
          .map(({ def, points }) => {
            const end = latest(points, 'avg')
            return `${MODELS[def.modelId].name}: ${points.length} episodes${end === null ? '' : `, ${AVERAGE_WINDOW}-episode average ends at ${formatNumber(end, 1)}`}.`
          })
          .join(' '))
  const missing = state.problems.map((problem) => ({ problem, def: defs.find((def) => def.dataset === problem.id) }))

  const tableColumns = built.map(({ def }) => ({ id: def.id, header: MODELS[def.modelId].shortName }))
  const lastAverage = (points) => (latest(points, 'avg') === null ? '—' : formatNumber(latest(points, 'avg'), 1))
  const tableRows = [
    { id: 'episodes', label: 'Episodes in the log', cells: Object.fromEntries(built.map(({ def, points }) => [def.id, formatCount(points.length)])) },
    {
      id: 'timesteps',
      label: 'Cumulative timesteps at the end',
      cells: Object.fromEntries(built.map(({ def, points }) => [def.id, points.length ? formatCount(points[points.length - 1].t) : '—'])),
    },
    {
      id: 'average',
      label: `Latest ${AVERAGE_WINDOW}-episode average (calculated here)`,
      cells: Object.fromEntries(built.map(({ def, points }) => [def.id, lastAverage(points)])),
    },
  ]
  if (hasRecorded) {
    tableRows.push({
      id: 'recorded',
      label: 'Latest recorded 100-episode average (reward_ma100)',
      cells: Object.fromEntries(
        built.map(({ def, points }) => [def.id, def.recorded ? (latest(points, 'recorded') === null ? '—' : formatNumber(latest(points, 'recorded'), 1)) : 'Not in this log']),
      ),
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.controls} role="group" aria-label={`Options for ${title}`}>
        {defs.length > 1 &&
          built.map(({ def }) => (
            <Button key={def.id} size="sm" pressed={!hidden[def.id]} onClick={() => setHidden((current) => ({ ...current, [def.id]: !current[def.id] }))}>
              <LineSample color={colorOf(def)} dash={MODEL_DASH[def.modelId]} />
              {MODELS[def.modelId].shortName}
            </Button>
          ))}
        <Button size="sm" pressed={showRaw} onClick={() => setShowRaw((value) => !value)}>
          Raw episodes
        </Button>
        {hasRecorded && (
          <Button size="sm" pressed={showRecorded} onClick={() => setShowRecorded((value) => !value)}>
            <LineSample color={colors.text} dash={RECORDED_DASH} />
            Recorded 100-episode average
          </Button>
        )}
      </div>

      <ChartCard title={heading} subtitle={subtitle} summary={summary} footnote={footnote}>
        {visible.length === 0 ? (
          <p className={styles.hiddenMessage}>All series are hidden. Turn one back on above.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 20, left: 0 }}>
              <CartesianGrid stroke={colors.borderSubtle} />
              <XAxis
                type="number"
                dataKey="t"
                domain={['dataMin', 'dataMax']}
                tickFormatter={formatSteps}
                stroke={colors.border}
                tick={{ fill: colors.textMuted, fontSize: AXIS_FONT_SIZE }}
                label={{ value: 'Cumulative timesteps in the log', position: 'insideBottom', offset: -12, fill: colors.textMuted, fontSize: AXIS_FONT_SIZE }}
              />
              <YAxis
                stroke={colors.border}
                tick={{ fill: colors.textMuted, fontSize: AXIS_FONT_SIZE }}
                tickFormatter={(value) => formatNumber(value, 0)}
                width={56}
              />
              <Tooltip isAnimationActive={false} content={<CurveTooltip lookups={lookups} showRaw={showRaw} showRecorded={showRecorded} />} />
              {showRaw &&
                visible.map(({ def }) => (
                  <Line key={`${def.id}Raw`} dataKey={`${def.id}Raw`} stroke={colorOf(def)} strokeOpacity={0.28} strokeWidth={1} dot={false} activeDot={false} connectNulls isAnimationActive={false} legendType="none" />
                ))}
              {visible.map(({ def }) => (
                <Line key={`${def.id}Avg`} dataKey={`${def.id}Avg`} stroke={colorOf(def)} strokeWidth={2.5} strokeDasharray={MODEL_DASH[def.modelId]} dot={false} activeDot={false} connectNulls isAnimationActive={false} legendType="none" />
              ))}
              {showRecorded &&
                visible
                  .filter(({ def }) => def.recorded)
                  .map(({ def }) => (
                    <Line key={`${def.id}Rec`} dataKey={`${def.id}Rec`} stroke={colors.text} strokeWidth={1.5} strokeDasharray={RECORDED_DASH} dot={false} activeDot={false} connectNulls isAnimationActive={false} legendType="none" />
                  ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {missing.length > 0 && (
        <Callout tone="warning" title="Some data is not shown">
          <ul className={styles.list}>
            {missing.map(({ problem, def }) => (
              <li key={problem.id}>
                {def ? MODELS[def.modelId].name : problem.id}: {problem.reason} (<code>{problem.file ?? DATASETS[problem.id]?.file}</code>)
              </li>
            ))}
          </ul>
        </Callout>
      )}

      <details className={styles.details}>
        <summary>View a summary of the logs as a table</summary>
        <DataTable caption={`${title}, log summary`} labelHeader="Measure" columns={tableColumns} rows={tableRows} />
      </details>
    </div>
  )
}

// Original environment reward for all three models, on one axis.
export function TrainingCurveChart() {
  return (
    <CurveChart
      title="Training curves: original environment reward"
      subtitle={`Original reward per training episode against cumulative timesteps. Thick lines are a ${AVERAGE_WINDOW}-episode moving average calculated in this app (it starts once ${AVERAGE_WINDOW} episodes exist); thin lines are the raw episodes.`}
      footnote="Baseline uses column r, which is its original reward. Bad Reward and Improved Reward use original_episode_return, not their training reward r. The optional dash-dot line is the baseline's own 100-episode average from the log (reward_ma100); it is a different average from the 50-episode one. Custom and shaped training rewards are on the Training objectives tab."
      defs={ORIGINAL_TRAINING_SERIES}
      datasetIds={ORIGINAL_TRAINING_DATASETS}
    />
  )
}

// One model's own training reward (custom, shaped or the shaping term), never compared across models.
export function ObjectiveCurveChart({ seriesId }) {
  const defs = OBJECTIVE_DEFS[seriesId]
  if (!defs) return <DataState status="error" title="Training objective" problems={[{ id: seriesId, reason: `"${seriesId}" is not a known objective series.` }]} />
  const series = defs[0]
  return (
    <CurveChart
      title={series.title}
      badge={series.badge}
      badgeTone={BADGE_TONES[series.kind]}
      subtitle={`${series.subtitle} Thick line: ${AVERAGE_WINDOW}-episode moving average calculated in this app; thin line: raw episodes.`}
      footnote={series.footnote}
      defs={defs}
      datasetIds={series.datasetIds}
    />
  )
}
