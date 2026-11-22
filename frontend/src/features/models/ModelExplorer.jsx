import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MODEL_FILES } from '../../data/assets.js'
import { MODEL_IDS, MODELS } from '../../data/models.js'
import {
  ACTIONS,
  BAD_REWARD_RULES,
  EXTRA_PARAMETER,
  OBSERVATIONS,
  PPO_CONFIG,
  TEX,
  TOTAL_NOTE,
  TRAINING_BUDGET,
  TRAINING_REWARD,
} from '../../data/research.js'
import { CUSTOM_REWARDS, EVALUATION, PROTOCOL } from '../../data/results.js'
import { formatNumber } from '../../utils/format.js'
import Section from '../../components/layout/Section.jsx'
import Formula from '../../components/math/Formula.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Callout from '../../components/ui/Callout.jsx'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import ExternalLink from '../../components/ui/ExternalLink.jsx'
import MetricCard from '../../components/ui/MetricCard.jsx'
import Tabs, { TabPanel } from '../../components/ui/Tabs.jsx'
import shared from '../shared/shared.module.css'

const TABS = MODEL_IDS.map((id) => ({ id, label: MODELS[id].name }))

function RewardStrategy({ id }) {
  if (id === 'baseline') {
    return (
      <p className={shared.cardText}>
        No reward wrapper. The agent trains on the original LunarLander-v3 reward, which already rewards approaching the pad, slowing down, staying upright and
        landing, and penalises fuel use and crashing.
      </p>
    )
  }
  if (id === 'badReward') {
    return (
      <>
        <p className={shared.cardText}>BadRewardWrapper replaces the original reward with a survival-based reward:</p>
        <ul className={shared.list}>
          {BAD_REWARD_RULES.map((rule) => (
            <li key={rule.condition}>
              <strong>{rule.reward}</strong>: {rule.condition}
            </li>
          ))}
        </ul>
        <Formula
          tex={TEX.rBad}
          label="R bad is plus 100 for a two-leg termination, minus 100 for any other termination, 0 when truncated, and plus 1 on every other step."
        />
        <p className={shared.cardText}>
          See <Link to="/reward-hacking">Reward Hacking</Link> for why this reward can favour survival over landing.
        </p>
      </>
    )
  }
  return (
    <>
      <p className={shared.cardText}>ImprovedRewardWrapper keeps the original reward and adds a potential-based shaping term scaled by α:</p>
      <Formula tex={TEX.shapedReward} label="R new equals R original plus alpha times F, with alpha 10 and gamma 0.999." />
      <p className={shared.cardText}>
        See <Link to="/reward-shaping">Reward Shaping</Link> for the potential function, its weights and the terminated and truncated handling.
      </p>
    </>
  )
}

function ModelDetail({ id }) {
  const model = MODELS[id]
  const result = EVALUATION[id]
  return (
    <div className={shared.stackLg}>
      <Card>
        <div className={shared.row}>
          <h3 className={shared.cardTitle} style={{ margin: 0 }}>
            {model.name}
          </h3>
          <Badge tone={model.badgeTone}>{model.role}</Badge>
        </div>
        <p className={shared.cardText} style={{ marginTop: 'var(--space-3)' }}>
          {model.summary}
        </p>
        <p className={`${shared.cardText} ${shared.small} ${shared.muted}`}>
          Saved model file: <ExternalLink href={MODEL_FILES[id].url}>{MODEL_FILES[id].file}</ExternalLink>
        </p>
      </Card>

      <Section id={`${id}-training`} title="Training configuration" description="How the model was trained. These are settings, not results.">
        <Card>
          <dl className={shared.facts}>
            <div>
              <dt>Training reward</dt>
              <dd>{TRAINING_REWARD[id]}</dd>
            </div>
            <div>
              <dt>Extra parameter</dt>
              <dd>{EXTRA_PARAMETER[id]}</dd>
            </div>
            <div>
              <dt>Timesteps</dt>
              <dd>
                {TRAINING_BUDGET.requested} requested, {TRAINING_BUDGET.actual} completed
              </dd>
            </div>
            <div>
              <dt>Training runs and seed</dt>
              <dd>One run, seed 42</dd>
            </div>
            <div>
              <dt>Algorithm</dt>
              <dd>PPO, MlpPolicy 64 × 64</dd>
            </div>
          </dl>
          <h4 className={shared.cardTitle} style={{ marginTop: 'var(--space-5)' }}>
            Reward strategy
          </h4>
          <RewardStrategy id={id} />
        </Card>
      </Section>

      <Section
        id={`${id}-evaluation`}
        title="Evaluation results (original reward)"
        description={`Measured in the ${PROTOCOL.environment}: ${PROTOCOL.episodes} ${PROTOCOL.actions} episodes, seeds ${PROTOCOL.seeds}.`}
      >
        <div className={shared.metrics}>
          <MetricCard
            label="Mean original reward"
            accentVar={model.colorVar}
            value={formatNumber(result.meanReward)}
            caption={`Standard deviation ${formatNumber(result.std)}`}
          />
          <MetricCard label="Mean episode length" accentVar={model.colorVar} value={formatNumber(result.meanLength)} unit="steps" />
          <MetricCard label="Successful landings" accentVar={model.colorVar} value={`${result.landed}/${PROTOCOL.episodes}`} />
          <MetricCard label="Crashes / timeouts" accentVar={model.colorVar} value={`${result.crashed} / ${result.timeouts}`} />
        </div>
        {id === 'badReward' && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Callout tone="warning" title="Custom reward shown separately">
              Under its own flawed objective this agent&apos;s mean custom reward was {CUSTOM_REWARDS.badReward.mean}. That number belongs to R_bad. It is not
              comparable with the original rewards above and does not measure landing.
            </Callout>
          </div>
        )}
        {id === 'improved' && (
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Callout title="Evaluated without the shaping term">
              The metrics above come from the original environment. The shaped reward the agent trained on is not used to rank it.
            </Callout>
          </div>
        )}
      </Section>
    </div>
  )
}

export default function ModelExplorer() {
  const [tab, setTab] = useState('baseline')
  return (
    <div className={shared.stackLg}>
      <Callout title="Training configuration versus evaluation results">
        Each model has two separate parts below: how it was trained (settings from the report) and how it performed (measured in the original environment with
        the original reward). {TOTAL_NOTE}
      </Callout>

      <div>
        <Tabs label="Choose a model" idPrefix="model" tabs={TABS} value={tab} onChange={setTab} />
        {MODEL_IDS.map((id) => (
          <TabPanel key={id} idPrefix="model" id={id} value={tab}>
            <ModelDetail id={id} />
          </TabPanel>
        ))}
      </div>

      <Section id="compare" title="Models side by side" description="Evaluation metrics use the original environment reward only.">
        <div className={shared.stack}>
          <DataTable
            caption="Evaluation results of the three models"
            labelHeader="Evaluation (original reward)"
            columns={MODEL_IDS.map((id) => ({ id, header: MODELS[id].shortName }))}
            rows={[
              ['Mean original reward', (r) => formatNumber(r.meanReward)],
              ['Standard deviation', (r) => formatNumber(r.std)],
              ['Mean episode length', (r) => formatNumber(r.meanLength)],
              ['Successful landings', (r) => `${r.landed}/${PROTOCOL.episodes}`],
              ['Crashes', (r) => r.crashed],
              ['Timeouts', (r) => r.timeouts],
            ].map(([label, get]) => ({ id: label, label, cells: Object.fromEntries(MODEL_IDS.map((id) => [id, get(EVALUATION[id])])) }))}
          />
          <DataTable
            caption="Training configuration of the three models"
            align="start"
            labelHeader="Training configuration"
            columns={MODEL_IDS.map((id) => ({ id, header: MODELS[id].shortName }))}
            rows={[
              ['Training reward', TRAINING_REWARD],
              ['Extra parameter', EXTRA_PARAMETER],
              ['Model file', Object.fromEntries(MODEL_IDS.map((id) => [id, MODEL_FILES[id].file]))],
            ].map(([label, values]) => ({ id: label, label, cells: Object.fromEntries(MODEL_IDS.map((id) => [id, values[id]])) }))}
          />
          <p className={`${shared.small} ${shared.muted}`}>
            Only ten episodes and one training run per model: the differences are observations, not statistically established. Full charts are on{' '}
            <Link to="/results">Results &amp; Analytics</Link>.
          </p>
        </div>
      </Section>

      <Section
        id="shared-config"
        title="Shared PPO configuration"
        description="Identical for all three models (report Table 1); the reward is the only experimental difference."
      >
        <div className={shared.stack}>
          <DataTable
            caption="PPO configuration shared by all three models"
            align="start"
            labelHeader="Parameter"
            columns={[{ id: 'value', header: 'Value' }]}
            rows={PPO_CONFIG.map((p) => ({ id: p.name, label: <code>{p.name}</code>, cells: { value: p.value } }))}
          />
          <p className={`${shared.small} ${shared.muted}`}>
            {TRAINING_BUDGET.note} The network has about {TRAINING_BUDGET.parameters} trainable parameters.
          </p>
        </div>
      </Section>

      <Section id="spaces" title="Observation and action spaces" description="What every model sees and can do in LunarLander-v3 (report Section 7).">
        <div className={shared.grid2}>
          <DataTable
            caption="The eight observation values"
            align="start"
            labelHeader="Index"
            columns={[{ id: 'meaning', header: 'Meaning' }]}
            rows={OBSERVATIONS.map((o) => ({ id: o.index, label: o.index, cells: { meaning: o.meaning } }))}
          />
          <DataTable
            caption="The four discrete actions"
            align="start"
            labelHeader="Action"
            columns={[{ id: 'meaning', header: 'Meaning' }]}
            rows={ACTIONS.map((a) => ({ id: a.id, label: a.id, cells: { meaning: a.meaning } }))}
          />
        </div>
      </Section>
    </div>
  )
}
