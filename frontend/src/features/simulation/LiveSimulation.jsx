import { useId, useState } from 'react'
import { Play, RotateCcw, Square, ServerOff } from 'lucide-react'
import Section from '../../components/layout/Section.jsx'
import VideoPlayer from '../../components/media/VideoPlayer.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Callout from '../../components/ui/Callout.jsx'
import Card from '../../components/ui/Card.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { VIDEOS } from '../../data/assets.js'
import { MODEL_IDS, MODELS } from '../../data/models.js'
import { ACTIONS, OBSERVATIONS } from '../../data/research.js'
import { API_BASE_URL } from '../../config/env.js'
import { useBackendHealth } from '../../hooks/useBackendHealth.js'
import { useSimulation } from '../../hooks/useSimulation.js'
import { formatNumber } from '../../utils/format.js'
import s from '../shared/shared.module.css'
import styles from './simulation.module.css'

const ENDPOINTS = [
  ['GET /api/health', 'Backend status shown in the top bar and on this page', 'Prepared; used when VITE_API_BASE_URL is set'],
  ['GET /api/models', 'Models the server can load', 'Service written, not wired (static model data is used)'],
  ['GET /api/results/summary', 'Evaluation summary', 'Service written, not wired (static data is used)'],
  ['GET /api/results/episodes?model=', 'Per-episode evaluation', 'Service written, not wired (static data is used)'],
  ['POST /api/simulations', 'Start a run: model, seed, deterministic', 'Used by Start'],
  ['GET /api/simulations/{id}/events', 'Server-sent frame, state and end events', 'Used while a run is active'],
  ['POST /api/simulations/{id}/reset', 'Restart the same model and seed', 'Used by Reset'],
  ['DELETE /api/simulations/{id}', 'Stop and free the run', 'Used by Stop'],
].map(([endpoint, purpose, status]) => ({ id: endpoint, label: <code>{endpoint}</code>, cells: { purpose, status } }))

const dash = '—'
const num = (value, digits = 3) => (typeof value === 'number' ? formatNumber(value, digits) : dash)

const PHASE_LABEL = { idle: 'Not started', starting: 'Starting', running: 'Running', finished: 'Finished', stopped: 'Stopped', error: 'Error' }

export default function LiveSimulation() {
  const { status: backend } = useBackendHealth()
  const { state, start, reset, stop } = useSimulation()
  const [modelId, setModelId] = useState('baseline')
  const [seed, setSeed] = useState(2024)
  const [deterministic, setDeterministic] = useState(true)
  const id = useId()

  const connected = backend === 'connected'
  const active = state.phase === 'starting' || state.phase === 'running'
  const t = state.telemetry
  const outcome = !t ? dash : t.terminated ? 'Terminated' : t.truncated ? 'Truncated (time limit)' : 'Running'
  const seedValid = Number.isInteger(seed) && seed >= 0

  return (
    <div className={s.stackLg}>
      {!connected && (
        <Callout tone="warning" title={backend === 'checking' ? 'Checking the backend' : 'The simulation backend is not connected'}>
          <p>
            {backend === 'not-configured'
              ? 'No backend is configured, so live simulation is unavailable. The controls below show what the interface will do once the Flask, Gymnasium and Stable-Baselines3 backend exists; nothing on this page is simulated or predicted by the website.'
              : backend === 'checking'
                ? 'Waiting for the backend to answer its health check.'
                : `The backend at ${API_BASE_URL} did not answer its health check, so live simulation is unavailable.`}
          </p>
          <p>The rest of the site works on the verified static research data. Recorded episodes are further down this page.</p>
        </Callout>
      )}

      <div className={styles.layout}>
        <Card>
          <h3 className={s.cardTitle}>Run settings</h3>
          <div className={s.stack}>
            <fieldset className={styles.fieldset} disabled={active}>
              <legend>Model</legend>
              {MODEL_IDS.map((model) => (
                <label key={model} className={styles.option}>
                  <input type="radio" name={`${id}-model`} value={model} checked={modelId === model} onChange={() => setModelId(model)} />
                  <span>
                    {MODELS[model].name} <span className={s.muted}>({MODELS[model].role})</span>
                  </span>
                </label>
              ))}
            </fieldset>
            <div className={styles.field}>
              <label htmlFor={`${id}-seed`}>Environment seed</label>
              <input id={`${id}-seed`} type="number" min="0" step="1" value={seed} disabled={active} onChange={(event) => setSeed(event.target.value === '' ? Number.NaN : Number(event.target.value))} aria-describedby={`${id}-seed-hint`} />
              <span id={`${id}-seed-hint`} className={`${s.small} ${s.muted}`}>The evaluation used seeds 2024–2033.</span>
            </div>
            <label className={styles.option}>
              <input type="checkbox" checked={deterministic} disabled={active} onChange={(event) => setDeterministic(event.target.checked)} />
              <span>Deterministic actions (as in the evaluation)</span>
            </label>
            <div className={s.row}>
              <Button variant="primary" icon={Play} loading={state.phase === 'starting'} disabled={!connected || active || !seedValid} onClick={() => start({ modelId, seed, deterministic })}>
                Start
              </Button>
              <Button icon={RotateCcw} disabled={!connected || state.phase !== 'running'} onClick={reset}>
                Reset
              </Button>
              <Button icon={Square} disabled={!active} onClick={stop}>
                Stop
              </Button>
            </div>
            {!connected && <p className={`${s.small} ${s.muted}`}>Controls are disabled until a backend is connected.</p>}
          </div>
        </Card>

        <div className={s.stack}>
          <Card>
            <div className={s.row} style={{ justifyContent: 'space-between' }}>
              <h3 className={s.cardTitle} style={{ margin: 0 }}>Simulation view</h3>
              <Badge tone={state.phase === 'error' ? 'danger' : active ? 'success' : 'neutral'}>{PHASE_LABEL[state.phase]}</Badge>
            </div>
            <div className={styles.viewer}>
              {state.frame ? (
                <img src={state.frame} alt="Current simulation frame from the backend" className={styles.frame} />
              ) : (
                <div className={styles.empty}>
                  <ServerOff size={32} aria-hidden="true" />
                  <p>{connected ? 'No frame yet. Start a simulation to see the lander.' : 'Live frames are unavailable without a connected backend.'}</p>
                </div>
              )}
            </div>
            {state.error && (
              <div style={{ marginTop: 'var(--space-3)' }}>
                <Callout tone="warning" title="The simulation stopped with an error">{state.error}</Callout>
              </div>
            )}
          </Card>

          <Card>
            <h3 className={s.cardTitle}>State</h3>
            <dl className={styles.telemetry} aria-live="off">
              {OBSERVATIONS.map((o) => (
                <div key={o.index}>
                  <dt>{o.meaning}</dt>
                  <dd>{t ? num(t.observation[o.index]) : dash}</dd>
                </div>
              ))}
              <div><dt>Action</dt><dd>{t ? (t.action === null ? 'none yet' : `${t.action}: ${ACTIONS[t.action].meaning}`) : dash}</dd></div>
              <div><dt>Step</dt><dd>{t ? t.step : dash}</dd></div>
              <div><dt>Step reward (original)</dt><dd>{t ? num(t.reward) : dash}</dd></div>
              <div><dt>Episode return (original)</dt><dd>{t ? num(t.episodeReturn, 1) : dash}</dd></div>
              <div><dt>Episode status</dt><dd>{outcome}</dd></div>
            </dl>
            <p className={`${s.small} ${s.muted}`}>Values appear only when the backend sends them. Rewards are original environment rewards.</p>
          </Card>
        </div>
      </div>

      <Section id="recorded" title="Recorded episodes" description="Real recordings from the repository. They are not live and do not respond to the controls above.">
        <div className={s.grid2}>
          <VideoPlayer video={VIDEOS.success} />
          <VideoPlayer video={VIDEOS.badReward} />
        </div>
      </Section>

      <Section id="integration" title="Backend integration points" description="The API the future Flask backend should provide. Frontend service code is in src/services; the full contract is in docs/BACKEND_CONTRACT.md.">
        <DataTable caption="Backend endpoints used by the frontend" align="start" labelHeader="Endpoint" columns={[{ id: 'purpose', header: 'Purpose' }, { id: 'status', header: 'Frontend status' }]} rows={ENDPOINTS} />
        <p className={`${s.small} ${s.muted}`} style={{ marginTop: 'var(--space-3)' }}>
          These services were checked against a mock server only; no real backend exists yet. Set VITE_API_BASE_URL (see .env.example) to point the site at one.
        </p>
      </Section>
    </div>
  )
}
