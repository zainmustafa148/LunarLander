import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useChartTheme } from '../../hooks/useChartTheme.js'
import { formatNumber } from '../../utils/format.js'
import ChartCard from './ChartCard.jsx'
import ChartTooltip from './ChartTooltip.jsx'
import { AXIS_FONT_SIZE } from './chartStyle.js'

const format = (value) => (typeof value === 'number' && Number.isFinite(value) ? formatNumber(value, 1) : '—')

function Tip({ active, payload, label, series, colors }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const rows = series.map((item) => ({ key: item.key, color: colors[item.colorKey], label: item.label, value: format(row[item.key]) }))
  return <ChartTooltip title={`Episode ${label}${row.outcome ? ` (${row.outcome})` : ''}`} rows={rows} />
}

/*
 * Per-episode bar chart for one reward kind. `data` rows look like { episode, outcome, [key]: number }.
 * `series` is [{ key, label, colorKey }] (colorKey from useChartTheme). `stacked` adds the series up.
 * Each chart shows ONE reward kind; callers never put different reward kinds in one chart.
 */
export default function SimpleEpisodeChart({ data, series, stacked = false, title, subtitle, summary, footnote, yLabel }) {
  const colors = useChartTheme()
  return (
    <ChartCard title={title} subtitle={subtitle} summary={summary} footnote={footnote}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 20, left: 0 }}>
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
            width={56}
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: colors.textMuted, fontSize: AXIS_FONT_SIZE } : undefined}
          />
          <ReferenceLine y={0} stroke={colors.border} />
          <Tooltip isAnimationActive={false} cursor={{ fill: colors.borderSubtle, fillOpacity: 0.5 }} content={<Tip series={series} colors={colors} />} />
          {series.length > 1 && <Legend verticalAlign="top" height={32} formatter={(value) => <span style={{ color: colors.text }}>{value}</span>} />}
          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={colors[item.colorKey]}
              stackId={stacked ? 'total' : undefined}
              maxBarSize={32}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
