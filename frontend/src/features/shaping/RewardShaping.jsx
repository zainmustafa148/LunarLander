import { Link } from 'react-router-dom'
import { ObjectiveCurveChart } from '../../components/charts/TrainingCurveChart.jsx'
import Formula from '../../components/math/Formula.jsx'
import FigureImage from '../../components/media/FigureImage.jsx'
import Section from '../../components/layout/Section.jsx'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import MetricCard from '../../components/ui/MetricCard.jsx'
import { FIGURES } from '../../data/assets.js'
import { MODELS } from '../../data/models.js'
import { POTENTIAL_WEIGHTS, SHAPING, TERMINAL_HANDLING, TEX } from '../../data/research.js'
import { EVALUATION } from '../../data/results.js'
import { formatNumber } from '../../utils/format.js'
import s from '../shared/shared.module.css'
import PotentialExplorer from './PotentialExplorer.jsx'
import ShapedEvidence from './ShapedEvidence.jsx'
import WhyNotOutperform from './WhyNotOutperform.jsx'

export default function RewardShaping() {
  const improved = EVALUATION.improved
  return (
    <div className={s.stackLg}>
      <Section id="summary" title="The experiment in one view" description="The original reward is kept and a potential-based term is added to it.">
        <div className={s.metrics}>
          <MetricCard label="Shaping coefficient α" accentVar={MODELS.improved.colorVar} value={String(SHAPING.alpha)} caption="A fixed setting; it was not tuned and no other value was compared." />
          <MetricCard label="Discount factor γ" accentVar={MODELS.improved.colorVar} value={String(SHAPING.gamma)} caption="The same γ as the PPO configuration." />
          <MetricCard label="Mean original reward" accentVar={MODELS.improved.colorVar} value={formatNumber(improved.meanReward)} caption={`Landed in ${improved.landed} of 10; ${improved.crashed} crash, ${improved.timeouts} timeouts.`} />
        </div>
      </Section>

      <Section id="theory" title="Potential-based reward shaping" description="The idea and its limits (report Section 12.1; Ng, Harada and Russell, 1999).">
        <div className={s.grid2}>
          <Card>
            <h3 className={s.cardTitle}>The shaping term</h3>
            <p className={s.cardText}>A potential function Φ scores each state. The shaping term rewards moving to a higher-potential state and charges for moving to a lower one:</p>
            <Formula tex={TEX.shapingF} label="F of s and s prime equals gamma times phi of s prime minus phi of s." />
            <p className={s.cardText}>The agent is trained on the original reward plus α times that term:</p>
            <Formula tex={TEX.shapedReward} label="R new equals R original plus alpha times F, with alpha 10 and gamma 0.999." />
          </Card>
          <Card>
            <h3 className={s.cardTitle}>Why this form, and what it does not guarantee</h3>
            <p className={s.cardText}>Over a whole episode the terms cancel in pairs, so only the first and last potentials remain:</p>
            <Formula tex={TEX.telescoping} label="The discounted sum of F over an episode equals gamma to the T times phi of s T minus phi of s zero." />
            <p className={s.cardText}>
              Because the extra return depends only on where an episode starts and ends, and not on the route between, Ng, Harada and Russell showed that this form does not change which policies are optimal, <em>under the assumptions of their theorem</em> (a fixed discount, a potential that depends on the state alone, and a well-defined handling of terminal states).
            </p>
            <p className={`${s.cardText} ${s.muted}`}>
              That is a statement about optimal policies. It does not say PPO, trained for a finite budget with α = 10, will do as well as training on the original reward. This project did not test policy invariance, and the results below show the shaped agent did not beat the Baseline. Adding a shaping term on top of the original reward, which already contains its own guidance, was not separately analysed (report Section 12.6).
            </p>
          </Card>
        </div>
      </Section>

      <Section id="potential" title="The potential function Φ(s)" description="Exactly as implemented in ImprovedRewardWrapper (report Section 12.4).">
        <div className={s.stack}>
          <Card>
            <Formula tex={TEX.potential} label="Phi of s is minus the weighted sum of distance, speed, absolute angle, absolute angular velocity and one minus gentle legs." />
            <Formula tex={TEX.distance} label="distance d is the square root of x squared plus y squared." />
            <Formula tex={TEX.speed} label="speed v is the square root of vx squared plus vy squared." />
            <Formula tex={TEX.gentle} label="gentle legs g is the average of the two leg contacts times the larger of zero and one minus speed over 0.5." />
          </Card>
          <div className={s.stack}>
            <DataTable
              caption="Weights of the potential function" align="start"
              labelHeader="Weight"
              columns={[
                { id: 'term', header: 'Applies to' },
                { id: 'value', header: 'Value' },
              ]}
              rows={POTENTIAL_WEIGHTS.map((w) => ({ id: w.symbol, label: <code>{w.symbol}</code>, cells: { term: w.term, value: w.value.toFixed(1) } }))}
            />
            <p className={`${s.small} ${s.muted}`}>Φ is lower (more negative) for states far from the pad, moving fast, tilted or spinning. Leg contact helps only when the lander is moving slowly. The weights were fixed settings and were not tuned.</p>
          </div>
        </div>
      </Section>

      <Section id="terminal" title="Terminated and truncated episodes" description="The wrapper treats the two endings differently (report Table 6).">
        <DataTable
          caption="Potential used for the next state" align="start"
          labelHeader="Situation"
          columns={[
            { id: 'potential', header: 'Φ(s′) used' },
            { id: 'reason', header: 'Reason' },
          ]}
          rows={TERMINAL_HANDLING.map((row) => ({ id: row.situation, label: row.situation, cells: { potential: row.potential, reason: row.reason } }))}
        />
      </Section>

      <Section id="explorer" title="Try the shaping term" description="Pick a current and a next state and see Φ, F and α · F.">
        <PotentialExplorer />
      </Section>

      <Section id="evidence" title="Original reward and shaped reward in the evaluation data" description="Ten episodes in the shaped environment. The two rewards are kept in separate charts.">
        <ShapedEvidence />
      </Section>

      <Section id="training" title="During training" description="Shaped reward and shaping term of the training episodes, one chart each, on their own scales.">
        <div className={s.stackLg}>
          <div className={s.grid2}>
            <ObjectiveCurveChart seriesId="improvedShaped" />
            <ObjectiveCurveChart seriesId="improvedShaping" />
          </div>
          <FigureImage figure={FIGURES.improvedTraining} maxWidth="44rem" />
          <p className={`${s.small} ${s.muted}`}>
            Original reward during training, for all three models, is on <Link to="/results">Results &amp; Analytics</Link>.
          </p>
        </div>
      </Section>

      <Section id="not-outperform" title="Why Improved Reward PPO did not outperform the Baseline" description="What the report states, and what the evaluation data shows.">
        <WhyNotOutperform />
      </Section>
    </div>
  )
}
