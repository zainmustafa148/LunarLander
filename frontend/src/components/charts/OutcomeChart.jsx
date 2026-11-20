import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EVALUATION } from '../../data/results.js'
import { MODEL_IDS, MODELS } from '../../data/models.js'
import { useChartTheme } from '../../hooks/useChartTheme.js'
import ChartCard from './ChartCard.jsx'

export default function OutcomeChart() {
  const colors = useChartTheme()

  const data = MODEL_IDS.map((id) => ({
    name: MODELS[id].shortName,
    fullName: MODELS[id].name,
    landed: EVALUATION[id].landed,
    crashed: EVALUATION[id].crashed,
    timeouts: EVALUATION[id].timeouts,
  }))

  const summary = `Stacked bar chart of episode outcomes out of 10: ${data
    .map((d) => `${d.fullName} ${d.landed} landed, ${d.crashed} crashed, ${d.timeouts} timed out`)
    .join('; ')}.`

  // Segments are labelled with their meaning ("10 landed"), so colour is never the only cue.
  const segment = (dataKey, name, fill, noun, textFill) => (
    <Bar dataKey={dataKey} name={name} stackId="outcomes" fill={fill} maxBarSize={96}>
      <LabelList
        dataKey={dataKey}
        position="center"
        formatter={(value) => (value > 0 ? `${value} ${noun}` : '')}
        fill={textFill}
        fontSize={11}
        fontWeight={600}
      />
    </Bar>
  )

  return (
    <ChartCard
      title="Episode outcomes"
      subtitle="Out of 10 evaluation episodes per model, original landing rule."
      summary={summary}
      footnote="Landed: terminated with final original reward +100. Crashed: terminated with −100. Timeout: truncated at 1,000 steps."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke={colors.borderSubtle} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: colors.text, fontSize: 12 }} stroke={colors.border} />
          <YAxis
            domain={[0, 10]}
            allowDecimals={false}
            tick={{ fill: colors.textMuted, fontSize: 11 }}
            stroke={colors.border}
            width={40}
          />
          <Tooltip
            cursor={{ fill: colors.borderSubtle, opacity: 0.4 }}
            contentStyle={{ background: colors.surface, borderColor: colors.border, color: colors.text, borderRadius: 8 }}
            labelStyle={{ color: colors.text }}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
          />
          <Legend wrapperStyle={{ color: colors.text, fontSize: 12 }} />
          {segment('landed', 'Landed', colors.success, 'landed', colors.surface)}
          {segment('crashed', 'Crashed', colors.danger, 'crashed', colors.surface)}
          {segment('timeouts', 'Timeout', colors.warning, 'timeouts', colors.surface)}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
