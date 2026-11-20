import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ErrorBar,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EVALUATION } from '../../data/results.js'
import { MODEL_IDS, MODELS } from '../../data/models.js'
import { useChartTheme } from '../../hooks/useChartTheme.js'
import { formatNumber } from '../../utils/format.js'
import ChartCard from './ChartCard.jsx'

// Axis tick showing the model name and its mean value, so numbers are readable without hovering.
function ModelTick({ x, y, payload, valuesByName, nameColor, valueColor }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" dy={18} fill={nameColor} fontSize={12}>
        {payload.value}
      </text>
      <text textAnchor="middle" dy={36} fill={valueColor} fontSize={12} fontWeight={600}>
        {valuesByName[payload.value]}
      </text>
    </g>
  )
}

const COLOR_KEYS = {
  baseline: 'modelBaseline',
  badReward: 'modelBadReward',
  improved: 'modelImproved',
}

export default function RewardChart() {
  const colors = useChartTheme()

  const data = MODEL_IDS.map((id) => ({
    id,
    name: MODELS[id].shortName,
    fullName: MODELS[id].name,
    mean: EVALUATION[id].meanReward,
    std: EVALUATION[id].std,
  }))

  const valuesByName = Object.fromEntries(data.map((d) => [d.name, formatNumber(d.mean)]))

  const summary = `Bar chart of mean original environment reward with standard deviation: ${data
    .map((d) => `${d.fullName} ${formatNumber(d.mean)} plus or minus ${formatNumber(d.std)}`)
    .join('; ')}.`

  return (
    <ChartCard
      title="Mean original environment reward"
      subtitle="Higher is better. Error bars show ± standard deviation over 10 episodes."
      summary={summary}
      footnote="Original reward only. Custom training rewards are never plotted here."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={colors.borderSubtle} vertical={false} />
          <XAxis
            dataKey="name"
            height={60}
            stroke={colors.border}
            tick={<ModelTick valuesByName={valuesByName} nameColor={colors.text} valueColor={colors.text} />}
          />
          <YAxis
            tick={{ fill: colors.textMuted, fontSize: 11 }}
            stroke={colors.border}
            tickFormatter={(value) => formatNumber(value, 0)}
            width={52}
          />
          <ReferenceLine y={0} stroke={colors.textMuted} />
          <Tooltip
            cursor={{ fill: colors.borderSubtle, opacity: 0.4 }}
            contentStyle={{ background: colors.surface, borderColor: colors.border, color: colors.text, borderRadius: 8 }}
            labelStyle={{ color: colors.text }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
            formatter={(value, _name, item) => [
              `${formatNumber(value)} ± ${formatNumber(item.payload.std)}`,
              'Mean original reward',
            ]}
          />
          <Bar dataKey="mean" maxBarSize={96} radius={[4, 4, 4, 4]}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={colors[COLOR_KEYS[entry.id]]} />
            ))}
            <ErrorBar dataKey="std" direction="y" stroke={colors.text} strokeWidth={2} width={8} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
