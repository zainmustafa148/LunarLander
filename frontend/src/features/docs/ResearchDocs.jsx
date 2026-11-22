import { Link } from 'react-router-dom'
import { Download } from 'lucide-react'
import Formula from '../../components/math/Formula.jsx'
import FigureImage from '../../components/media/FigureImage.jsx'
import Section from '../../components/layout/Section.jsx'
import Callout from '../../components/ui/Callout.jsx'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import ExternalLink from '../../components/ui/ExternalLink.jsx'
import { DATASET_FILES, FIGURES, MODEL_FILES, REPO_LINKS, REPORT, VIDEOS } from '../../data/assets.js'
import { PROJECT, SHARED_CONFIG } from '../../data/overview.js'
import { MODEL_IDS, MODELS } from '../../data/models.js'
import {
  ABSTRACT, ACTIONS, BACKGROUND, BAD_REWARD_RULES, DOC_STATUS, EXTRA_PARAMETER, FUTURE_WORK, LIMITATIONS_FULL, OBSERVATIONS,
  POTENTIAL_WEIGHTS, PPO_CONFIG, REFERENCES, REWARD_TYPES, TEX, TOOLS, TRAINING_BUDGET, TRAINING_REWARD, VERSIONS,
} from '../../data/research.js'
import { DIFFERENCES, EVALUATION, PROTOCOL } from '../../data/results.js'
import { useActiveSection } from '../../hooks/useActiveSection.js'
import { formatNumber, formatSigned } from '../../utils/format.js'
import s from '../shared/shared.module.css'
import styles from './docs.module.css'

const TOC = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'introduction', label: 'Introduction and objectives' },
  { id: 'background', label: 'Reinforcement learning background' },
  { id: 'ppo', label: 'The PPO algorithm' },
  { id: 'environment', label: 'The environment' },
  { id: 'methodology', label: 'Methodology and tools' },
  { id: 'experiments', label: 'The three experiments' },
  { id: 'evaluation', label: 'Evaluation method' },
  { id: 'results', label: 'Results' },
  { id: 'discussion', label: 'Discussion' },
  { id: 'limitations', label: 'Limitations' },
  { id: 'conclusion', label: 'Conclusion' },
  { id: 'future-work', label: 'Future work' },
  { id: 'references', label: 'References' },
  { id: 'resources', label: 'Resources and downloads' },
  { id: 'status', label: 'Documentation status' },
]
const TOC_IDS = TOC.map((item) => item.id)

function TableOfContents({ active }) {
  const links = TOC.map((item) => (
    <li key={item.id}>
      <a href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined} className={active === item.id ? styles.current : undefined}>
        {item.label}
      </a>
    </li>
  ))
  return (
    <>
      <details className={styles.mobileToc}>
        <summary>On this page</summary>
        <ul className={s.plain}>{links}</ul>
      </details>
      <nav className={styles.toc} aria-label="On this page">
        <p className={styles.tocTitle}>On this page</p>
        <ul className={s.plain}>{links}</ul>
      </nav>
    </>
  )
}

const cite = (n) => <sup className={styles.cite}>[{n}]</sup>

export default function ResearchDocs() {
  const active = useActiveSection(TOC_IDS)
  return (
    <div className={styles.layout}>
      <TableOfContents active={active} />
      <div className={s.stackLg}>
        <Callout title="About this page">
          Everything here is taken from the project report and the repository. Numbers are the report&apos;s; nothing is re-measured by the website. The full interactive results are on <Link to="/results">Results &amp; Analytics</Link>.
        </Callout>

        <Section id="abstract" title="Abstract">
          {ABSTRACT.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Section>

        <Section id="introduction" title="Introduction and objectives">
          {PROJECT.introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <h3 className={s.cardTitle}>Research question</h3>
          <blockquote className={styles.quote}>{PROJECT.researchQuestion}</blockquote>
          <h3 className={s.cardTitle}>Objectives</h3>
          <ol className={s.list}>
            {PROJECT.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
          <p>{PROJECT.principle}</p>
        </Section>

        <Section id="background" title="Reinforcement learning background" description="The concepts the experiments rely on (report Section 5).">
          <p>
            {BACKGROUND.mdp} {cite(1)}
          </p>
          <Formula tex={TEX.mdp} label="The tuple of states, actions, transition probabilities, reward function and discount factor." />
          <p>{BACKGROUND.returnText}</p>
          <Formula tex={TEX.returnG} label="The return G t is the sum over k of gamma to the k times the reward r t plus k plus 1." />
          <Formula tex={TEX.objective} label="The objective J of theta is the expected return from the start, under the policy." />
          <p>{BACKGROUND.endings} {cite(7)}</p>
          <p>{BACKGROUND.shapingText}</p>
        </Section>

        <Section id="ppo" title="The PPO algorithm" description="Proximal Policy Optimization, an actor-critic policy-gradient method (report Section 6).">
          <p>
            PPO was proposed by Schulman et al. {cite(2)} as a simpler successor to Trust Region Policy Optimization {cite(3)}. The actor is the policy π_θ(a | s); the critic V_φ(s) estimates how good a state is and is used to compute advantages.
          </p>
          <h3 className={s.cardTitle}>Advantage estimation</h3>
          <Formula tex={TEX.td} label="The temporal difference error delta t equals r t plus gamma V of the next state minus V of the state." />
          <Formula tex={TEX.gae} label="The advantage is the sum over l of gamma lambda to the l times delta t plus l." />
          <p>Generalized Advantage Estimation {cite(4)} uses λ = 0.98 here to trade off bias and variance.</p>
          <h3 className={s.cardTitle}>Clipped objective</h3>
          <Formula tex={TEX.ratio} label="The ratio rho t is the probability of the action under the new policy divided by that under the old policy." />
          <Formula tex={TEX.clip} label="The clipped objective is the expectation of the minimum of rho times the advantage and the clipped rho times the advantage." />
          <Formula tex={TEX.loss} label="The full loss is minus the clipped objective plus c one times the value loss minus c two times the entropy bonus." />
          <p>With ε = 0.2, vf_coef c₁ = 0.5 and ent_coef c₂ = 0.01.</p>
          <h3 className={s.cardTitle}>Training loop and configuration</h3>
          <p>{TRAINING_BUDGET.note} Each rollout is split into minibatches of 64 and used for 4 epochs.</p>
          <DataTable caption="PPO configuration shared by all three experiments" align="start" labelHeader="Parameter" columns={[{ id: 'value', header: 'Value' }]} rows={PPO_CONFIG.map((p) => ({ id: p.name, label: <code>{p.name}</code>, cells: { value: p.value } }))} />
        </Section>

        <Section id="environment" title="The environment" description="LunarLander-v3 with discrete actions (report Section 7).">
          <p>
            LunarLander is a Box2D-based rocket-landing task in the Gymnasium library {cite(7)}{cite(10)}. The lander starts at the top of the screen and must touch down gently on the pad at (0, 0).
          </p>
          <div className={s.grid2}>
            <DataTable caption="The eight observation values" align="start" labelHeader="Index" columns={[{ id: 'meaning', header: 'Meaning' }]} rows={OBSERVATIONS.map((o) => ({ id: o.index, label: o.index, cells: { meaning: o.meaning } }))} />
            <DataTable caption="The four discrete actions" align="start" labelHeader="Action" columns={[{ id: 'meaning', header: 'Meaning' }]} rows={ACTIONS.map((a) => ({ id: a.id, label: a.id, cells: { meaning: a.meaning } }))} />
          </div>
          <p>
            An episode terminates when the lander crashes, leaves the viewport or comes to rest, and is truncated at 1,000 steps. The same landing rule is applied to every model:
          </p>
          <DataTable caption="Landing classification rule" align="start" labelHeader="Outcome" columns={[{ id: 'rule', header: 'Rule' }]} rows={PROJECT.landingRule.map((r) => ({ id: r.outcome, label: r.outcome, cells: { rule: r.rule } }))} />
        </Section>

        <Section id="methodology" title="Methodology and tools" description="How the experiments were built (report Sections 8 and 9).">
          <p>The same environment, PPO configuration, logging and evaluation harness are used for all three experiments. Only the reward wrapper differs.</p>
          <FigureImage figure={FIGURES.pipeline} maxWidth="34rem" />
          <ul className={s.list}>
            <li>The wrappers change only the reward returned to the learning algorithm. Physics, observations and the terminated and truncated signals are unchanged, and the original reward is passed along in the info dictionary so true performance can be recorded.</li>
            <li>The Stable-Baselines3 Monitor sits outside the wrappers, so training logs contain the custom reward plus extra columns for the original episode return.</li>
            <li>One evaluation function scores every model in the unwrapped environment on the same seeds, reloading the models from their saved files.</li>
            <li>The notebook included automated checks of the wrappers (hand-computed potentials, scripted terminated and truncated cases, a no-survival-reward check and a comparison with the original environment).</li>
          </ul>
          <div className={s.grid2}>
            <DataTable caption="Software used in the project" align="start" labelHeader="Tool" columns={[{ id: 'purpose', header: 'Purpose' }]} rows={TOOLS.map((t) => ({ id: t.tool, label: t.tool, cells: { purpose: t.purpose } }))} />
            <DataTable caption="Recorded software versions" align="start" labelHeader="Package" columns={[{ id: 'value', header: 'Version' }]} rows={VERSIONS.map((v) => ({ id: v.name, label: v.name, cells: { value: v.value } }))} />
          </div>
        </Section>

        <Section id="experiments" title="The three experiments" description="Identical algorithm settings; the reward is the only difference (report Sections 10 to 13).">
          <DataTable
            caption="Configuration of the three experiments" align="start"
            labelHeader="Item"
            columns={MODEL_IDS.map((id) => ({ id, header: MODELS[id].shortName }))}
            rows={[
              ['Training reward', TRAINING_REWARD],
              ['Extra parameter', EXTRA_PARAMETER],
              ['Model file', Object.fromEntries(MODEL_IDS.map((id) => [id, MODEL_FILES[id].file]))],
              ...SHARED_CONFIG.map((c) => [c.label, Object.fromEntries(MODEL_IDS.map((id) => [id, c.value]))]),
            ].map(([label, values]) => ({ id: label, label, cells: Object.fromEntries(MODEL_IDS.map((id) => [id, values[id]])) }))}
          />
          <div className={s.grid2} style={{ marginTop: 'var(--space-4)' }}>
            <Card>
              <h3 className={s.cardTitle}>Baseline</h3>
              <p className={s.cardText}>Original reward, no wrapper. It sets the reference performance.</p>
            </Card>
            <Card>
              <h3 className={s.cardTitle}>Reward hacking: R_bad</h3>
              <ul className={s.list}>
                {BAD_REWARD_RULES.map((r) => (
                  <li key={r.condition}><strong>{r.reward}</strong>: {r.condition}</li>
                ))}
              </ul>
              <p className={s.cardText}>Details and evidence: <Link to="/reward-hacking">Reward Hacking</Link>.</p>
            </Card>
          </div>
          <Card className={styles.gap}>
            <h3 className={s.cardTitle}>Reward shaping: potential-based</h3>
            <Formula tex={TEX.shapedReward} label="R new equals R original plus alpha times F, with alpha 10 and gamma 0.999." />
            <Formula tex={TEX.potential} label="Phi of s is minus the weighted sum of distance, speed, absolute angle, absolute angular velocity and one minus gentle legs." />
            <p className={s.cardText}>
              Weights: {POTENTIAL_WEIGHTS.map((w) => `${w.symbol} = ${w.value.toFixed(1)}`).join(', ')}. Φ(s′) = 0 on termination and the real Φ(s′) on truncation. Details: <Link to="/reward-shaping">Reward Shaping</Link>.
            </p>
          </Card>
          <h3 className={s.cardTitle} style={{ marginTop: 'var(--space-5)' }}>Reward types</h3>
          <DataTable caption="Reward types used in the project" align="start" labelHeader="Quantity" columns={[{ id: 'meaning', header: 'Meaning' }, { id: 'used', header: 'Used for the final comparison?' }]} rows={REWARD_TYPES.map((r) => ({ id: r.quantity, label: r.quantity, cells: { meaning: r.meaning, used: r.used } }))} />
        </Section>

        <Section id="evaluation" title="Evaluation method" description="One protocol for all models (report Section 13).">
          <ul className={s.list}>
            <li>Environment: {PROTOCOL.environment}, so every model is judged by the same reward.</li>
            <li>{PROTOCOL.episodes} episodes per model with seeds {PROTOCOL.seeds}, {PROTOCOL.actions} actions.</li>
            <li>Metrics: mean original reward, standard deviation, mean episode length, landings, crashes and timeouts.</li>
            <li>Custom and shaped rewards are used for training and diagnostics only, never for the final comparison.</li>
            <li>Fixed seeds, saved models, CSV logs and one evaluation function support reproducibility; bit-for-bit reproduction across library versions or hardware is not guaranteed.</li>
          </ul>
        </Section>

        <Section id="results" title="Results" description="Original environment reward, original landing rule (report Tables 9 to 11).">
          <DataTable
            caption="Comparison of the three PPO models"
            labelHeader="Metric"
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
          <h3 className={s.cardTitle} style={{ marginTop: 'var(--space-5)' }}>Differences (second minus first)</h3>
          <DataTable caption="Differences between models" labelHeader="Comparison" columns={[{ id: 'reward', header: 'Δ mean original reward' }, { id: 'length', header: 'Δ mean length (steps)' }, { id: 'landings', header: 'Δ landings' }]} rows={DIFFERENCES.map((d) => ({ id: d.id, label: d.label, cells: { reward: formatSigned(d.reward), length: formatSigned(d.length), landings: d.landings > 0 ? `+${d.landings}` : d.landings < 0 ? `−${Math.abs(d.landings)}` : '0' } }))} />
          <p className={`${s.small} ${s.muted}`} style={{ marginTop: 'var(--space-3)' }}>
            Standard deviation is over the ten episodes of each model. The Bad Reward agent&apos;s mean custom reward of 999 and the Improved model&apos;s training-environment reward belong to their own objectives and are not part of this comparison. Ranking by mean original reward: Baseline (260.5) &gt; Improved Reward (230.2) &gt; Bad Reward (−599.2).
          </p>
          <FigureImage figure={FIGURES.comparison} maxWidth="40rem" />
        </Section>

        <Section id="discussion" title="Discussion" description="Report Section 15.">
          <ul className={s.list}>
            <li><strong>The Bad Reward agent maximised its objective but failed the task.</strong> It scored 999 on its own reward and −599.2 on the original, with no landings. An episode that continues to the time limit can earn more under R_bad than one that lands.</li>
            <li><strong>The Improved Reward agent did not outperform the Baseline.</strong> It landed 9 of 10 times with a mean of 230.2 against 260.5. The report lists the shaping coefficient, potential weights, interaction with the original reward and the training budget as possible factors, none of them independently tested.</li>
            <li><strong>Training reward is not evaluation performance.</strong> Ranking by each agent&apos;s own reward would have been misleading, so every model is judged by the original reward and one landing rule.</li>
            <li><strong>Software engineering view.</strong> A reward is a formal statement of the objective; loopholes in it can be exploited by an optimiser. Modular wrappers, a common evaluation procedure, saved models, fixed seeds and structured logs make the results easier to interpret.</li>
          </ul>
        </Section>

        <Section id="limitations" title="Limitations">
          <ul className={s.list}>
            {LIMITATIONS_FULL.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section id="conclusion" title="Conclusion">
          <p>
            Reward design changed what the agents learned. The Baseline achieved the best overall results, with a mean original reward of 260.5 and 10 of 10 landings. The Bad Reward agent reached a custom reward of 999 and landed in none of its episodes. The Improved Reward agent landed 9 of 10 times, much better than the Bad Reward agent but not better than the Baseline.
          </p>
          <p>The results are limited to the tested environment, training configurations and ten evaluation episodes per model. They are experimental observations, not statistically conclusive evidence, and a foundation for further experiments.</p>
        </Section>

        <Section id="future-work" title="Future work">
          <ul className={s.list}>
            {FUTURE_WORK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section id="references" title="References">
          <ol className={styles.refs}>
            {REFERENCES.map((ref) => (
              <li key={ref.n} value={ref.n}>
                {ref.text} {ref.url && <ExternalLink href={ref.url}>{ref.url}</ExternalLink>}
              </li>
            ))}
          </ol>
        </Section>

        <Section id="resources" title="Resources and downloads" description="Files that exist in the repository. Links to GitHub open the main branch.">
          <div className={s.stack}>
            <Card>
              <h3 className={s.cardTitle}>Project report</h3>
              <p className={s.cardText}>{REPORT.title}. {REPORT.note}</p>
              <div className={s.row}>
                <a className={styles.download} href={REPORT.localUrl} download>
                  <Download size={16} aria-hidden="true" /> Download the report (.docx)
                </a>
                <ExternalLink href={REPORT.repoUrl}>View on GitHub</ExternalLink>
              </div>
            </Card>
            <Card>
              <h3 className={s.cardTitle}>Repository</h3>
              <ul className={s.plain}>
                <li><ExternalLink href={REPO_LINKS.repo}>Project repository</ExternalLink></li>
                <li><ExternalLink href={REPO_LINKS.readme}>README</ExternalLink></li>
              </ul>
            </Card>
            <Card>
              <h3 className={s.cardTitle}>Graphs</h3>
              <ul className={s.plain}>
                {Object.values(FIGURES).map((figure) => (
                  <li key={figure.src}>
                    <a href={figure.src} target="_blank" rel="noopener noreferrer">{figure.title}</a>
                    <span className={s.muted}> ({figure.width} × {figure.height} px)</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3 className={s.cardTitle}>Datasets</h3>
              <p className={s.cardText}>The 12 research CSV files, with the JSON copies this website loads. The CSV files are unchanged.</p>
              <DataTable
                caption="Research datasets" align="start"
                labelHeader="Dataset"
                columns={[{ id: 'description', header: 'Contents' }, { id: 'csv', header: 'CSV' }, { id: 'json', header: 'JSON copy' }]}
                rows={DATASET_FILES.map((d) => ({
                  id: d.name,
                  label: <code>{d.name}</code>,
                  cells: {
                    description: d.description,
                    csv: <ExternalLink href={d.csvUrl}>CSV</ExternalLink>,
                    json: <a href={d.jsonUrl} target="_blank" rel="noopener noreferrer">JSON<span className="visually-hidden"> (opens in a new tab)</span></a>,
                  },
                }))}
              />
            </Card>
            <Card>
              <h3 className={s.cardTitle}>Recorded episodes and models</h3>
              <ul className={s.plain}>
                {Object.values(VIDEOS).map((video) => (
                  <li key={video.src}>
                    <a href={video.src} target="_blank" rel="noopener noreferrer">{video.title}<span className="visually-hidden"> (opens in a new tab)</span></a>
                    <span className={s.muted}> ({video.durationLabel}; also on </span>
                    <Link to="/simulation">Live Simulation</Link>
                    <span className={s.muted}>)</span>
                  </li>
                ))}
                {MODEL_IDS.map((id) => (
                  <li key={id}>
                    <ExternalLink href={MODEL_FILES[id].url}>{MODEL_FILES[id].file}</ExternalLink>
                    <span className={s.muted}> ({MODELS[id].name} model file)</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        <Section id="status" title="Documentation status" description="What is missing or unconfirmed, stated plainly.">
          <ul className={s.list}>
            {DOC_STATUS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  )
}
