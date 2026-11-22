import { Link } from 'react-router-dom'
import { ObjectiveCurveChart, TrainingCurveChart } from '../../components/charts/TrainingCurveChart.jsx'
import Formula from '../../components/math/Formula.jsx'
import FigureImage from '../../components/media/FigureImage.jsx'
import VideoPlayer from '../../components/media/VideoPlayer.jsx'
import Section from '../../components/layout/Section.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Callout from '../../components/ui/Callout.jsx'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import MetricCard from '../../components/ui/MetricCard.jsx'
import { FIGURES, VIDEOS } from '../../data/assets.js'
import { MODELS } from '../../data/models.js'
import { BAD_REWARD_NOTE, BAD_REWARD_REMOVED, BAD_REWARD_RULES, HYPOTHESIS, HYPOTHESIS_NOTE, TEX } from '../../data/research.js'
import { CUSTOM_REWARDS, EVALUATION } from '../../data/results.js'
import { formatNumber } from '../../utils/format.js'
import s from '../shared/shared.module.css'
import BadRewardEvidence from './BadRewardEvidence.jsx'
import RewardCalculator from './RewardCalculator.jsx'

export default function RewardHacking() {
  const bad = EVALUATION.badReward
  return (
    <div className={s.stackLg}>
      <Section id="summary" title="The experiment in one view" description="A reward that pays for staying alive, tested on the same PPO setup as the other two models.">
        <div className={s.metrics}>
          <MetricCard label="Custom reward (R_bad)" accentVar={MODELS.badReward.colorVar} value={String(CUSTOM_REWARDS.badReward.mean)} unit="mean, own objective" caption="Not comparable with original reward." badge={<Badge tone="warning">Custom</Badge>} />
          <MetricCard label="Original reward" accentVar={MODELS.badReward.colorVar} value={formatNumber(bad.meanReward)} unit="mean, original environment" caption={`Standard deviation ${formatNumber(bad.std)}.`} badge={<Badge tone="primary">Original</Badge>} />
          <MetricCard label="Outcomes" accentVar={MODELS.badReward.colorVar} value={`${bad.landed} / ${bad.crashed} / ${bad.timeouts}`} unit="landed / crashed / timeout" caption="Every episode reached the 1,000-step limit." />
        </div>
      </Section>

      <Section id="flawed-reward" title="The flawed reward" description="BadRewardWrapper replaces the original reward with this one (report Section 11.2).">
        <div className={s.grid2}>
          <DataTable caption="Rules of the flawed reward R_bad" align="start" labelHeader="Situation" columns={[{ id: 'reward', header: 'Reward' }]} rows={BAD_REWARD_RULES.map((r) => ({ id: r.condition, label: r.condition, cells: { reward: r.reward } }))} />
          <Card>
            <Formula tex={TEX.rBad} label="R bad is plus 100 for a two-leg termination, minus 100 for any other termination, 0 when truncated, and plus 1 on every other step." />
            <p className={s.cardText}>{BAD_REWARD_NOTE}</p>
            <p className={`${s.cardText} ${s.muted}`}>{BAD_REWARD_REMOVED}</p>
          </Card>
        </div>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Callout tone="warning" title="Hypothesis tested">
            <p>{HYPOTHESIS}</p>
            <p>{HYPOTHESIS_NOTE}</p>
          </Callout>
        </div>
      </Section>

      <Section id="why-survival" title="Why survival can look better than landing" description="A calculation from the reward rules alone. Adjust the numbers to see how the comparison changes.">
        <RewardCalculator />
      </Section>

      <Section id="evidence" title="What the evaluation measured" description="Ten deterministic episodes, seeds 2024–2033, scored two different ways. Source: the Bad Reward evaluation file.">
        <BadRewardEvidence />
      </Section>

      <Section id="training" title="During training" description="The same agent&apos;s training episodes, one chart per reward kind.">
        <div className={s.stackLg}>
          <ObjectiveCurveChart seriesId="badCustom" />
          <div>
            <Callout title="Original reward during training">
              The chart below shows the original environment reward of the training episodes of all three models. It is a different quantity from the custom reward above.
            </Callout>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <TrainingCurveChart />
            </div>
          </div>
          <div className={s.grid2}>
            <FigureImage figure={FIGURES.badTraining} />
            <FigureImage figure={FIGURES.badEval} />
          </div>
          <FigureImage figure={FIGURES.hackingComparison} />
        </div>
      </Section>

      <Section id="recording" title="A recorded episode" description="The only video of the Bad Reward agent in the repository.">
        <div className={s.grid2}>
          <VideoPlayer video={VIDEOS.badReward} />
          <Callout tone="warning" title="What the video does and does not show">
            The evaluation logs label these episodes as timeouts, and the report says no particular flight behaviour (hovering, drifting or anything else) is claimed without trajectory or video analysis. This video is provided so you can look at it yourself. It is one recorded episode, not a trajectory analysis.
          </Callout>
        </div>
      </Section>

      <Section id="interpretation" title="What the evidence supports">
        <div className={s.grid2}>
          <Card>
            <h3 className={s.cardTitle}>Supported by the data</h3>
            <ul className={s.list}>
              <li>The agent scored {CUSTOM_REWARDS.badReward.mean} under its own objective but {formatNumber(bad.meanReward)} on the original reward.</li>
              <li>It did not land in any of the 10 evaluation episodes; all 10 reached the 1,000-step limit.</li>
              <li>Ranking by training reward would have been misleading, which is why every model is judged on the original reward.</li>
            </ul>
          </Card>
          <Card>
            <h3 className={s.cardTitle}>Not established</h3>
            <ul className={s.list}>
              <li>How the lander moved. No trajectory, altitude or engine-usage analysis was done.</li>
              <li>That the agent hovered. A timeout only means the episode reached the step limit.</li>
              <li>Statistical significance: ten episodes and one training run.</li>
            </ul>
          </Card>
        </div>
        <p className={`${s.small} ${s.muted}`} style={{ marginTop: 'var(--space-4)' }}>
          Compare with the shaped reward in <Link to="/reward-shaping">Reward Shaping</Link>, or see all three models on <Link to="/results">Results &amp; Analytics</Link>.
        </p>
      </Section>
    </div>
  )
}
