import { useId, useState } from 'react'
import Callout from '../../components/ui/Callout.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import { SHAPING } from '../../data/research.js'
import { formatNumber, formatSigned } from '../../utils/format.js'
import { shapingStep } from '../../utils/potential.js'
import s from '../shared/shared.module.css'
import styles from './shaping.module.css'

const FIELDS = [
  { key: 'x', label: 'x', min: -1, max: 1, step: 0.01 },
  { key: 'y', label: 'y', min: 0, max: 1.5, step: 0.01 },
  { key: 'vx', label: 'vₓ', min: -2, max: 2, step: 0.01 },
  { key: 'vy', label: 'v_y', min: -2, max: 2, step: 0.01 },
  { key: 'angle', label: 'angle', min: -1, max: 1, step: 0.01 },
  { key: 'angvel', label: 'angular velocity', min: -2, max: 2, step: 0.01 },
]

// Illustrative states chosen for this explorer. They are NOT recorded from any episode.
const PRESETS = [
  {
    id: 'toward',
    label: 'Moving toward the pad',
    state: { x: 0.5, y: 1.0, vx: -0.1, vy: -0.4, angle: 0.1, angvel: 0, left: 0, right: 0 },
    next: { x: 0.45, y: 0.95, vx: -0.1, vy: -0.4, angle: 0.1, angvel: 0, left: 0, right: 0 },
    terminated: false,
  },
  {
    id: 'away',
    label: 'Drifting away',
    state: { x: 0.45, y: 0.95, vx: 0.1, vy: 0.2, angle: 0.1, angvel: 0, left: 0, right: 0 },
    next: { x: 0.55, y: 1.05, vx: 0.1, vy: 0.2, angle: 0.1, angvel: 0, left: 0, right: 0 },
    terminated: false,
  },
  {
    id: 'touchdown',
    label: 'Gentle touchdown (terminated)',
    state: { x: 0.02, y: 0.1, vx: 0, vy: -0.1, angle: 0, angvel: 0, left: 1, right: 1 },
    next: { x: 0.02, y: 0.1, vx: 0, vy: 0, angle: 0, angvel: 0, left: 1, right: 1 },
    terminated: true,
  },
]

function StateEditor({ title, state, onChange }) {
  const id = useId()
  return (
    <fieldset className={styles.fieldset}>
      <legend>{title}</legend>
      {FIELDS.map((field) => (
        <div key={field.key} className={styles.field}>
          <label htmlFor={`${id}-${field.key}`}>
            {field.label}: <span className={s.mono}>{state[field.key].toFixed(2)}</span>
          </label>
          <input id={`${id}-${field.key}`} type="range" min={field.min} max={field.max} step={field.step} value={state[field.key]} onChange={(event) => onChange({ ...state, [field.key]: Number(event.target.value) })} />
        </div>
      ))}
      <div className={styles.checks}>
        {['left', 'right'].map((leg) => (
          <label key={leg}>
            <input type="checkbox" checked={state[leg] === 1} onChange={(event) => onChange({ ...state, [leg]: event.target.checked ? 1 : 0 })} /> {leg} leg contact
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export default function PotentialExplorer() {
  const [preset, setPreset] = useState(PRESETS[0])
  const [state, setState] = useState(PRESETS[0].state)
  const [next, setNext] = useState(PRESETS[0].next)
  const [terminated, setTerminated] = useState(PRESETS[0].terminated)
  const result = shapingStep(state, next, terminated)

  const apply = (item) => {
    setPreset(item)
    setState(item.state)
    setNext(item.next)
    setTerminated(item.terminated)
  }

  return (
    <Card>
      <div className={s.stack}>
        <Callout title="Illustration, not recorded data">
          This explorer applies the report&apos;s formulas to two states you choose. The starting values and slider ranges are chosen for this page. They are not taken from any episode or model, and no original reward is computed.
        </Callout>
        <div className={s.row} role="group" aria-label="Example states">
          {PRESETS.map((item) => (
            <Button key={item.id} size="sm" pressed={preset.id === item.id} onClick={() => apply(item)}>
              {item.label}
            </Button>
          ))}
        </div>
        <div className={styles.editors}>
          <StateEditor title="Current state s" state={state} onChange={setState} />
          <StateEditor title="Next state s′" state={next} onChange={setNext} />
        </div>
        <label className={styles.terminated}>
          <input type="checkbox" checked={terminated} onChange={(event) => setTerminated(event.target.checked)} /> The episode terminated on this step (Φ(s′) is then set to 0)
        </label>
        <dl className={styles.results} aria-live="polite">
          <div><dt>Φ(s)</dt><dd>{formatNumber(result.current.potential, 3)}</dd></div>
          <div><dt>Φ(s′) used</dt><dd>{formatNumber(result.nextPotential, 3)}{terminated ? ' (terminal)' : ''}</dd></div>
          <div><dt>F = γΦ(s′) − Φ(s)</dt><dd>{formatSigned(result.f, 3)}</dd></div>
          <div><dt>α · F (α = {SHAPING.alpha})</dt><dd>{formatSigned(result.scaled, 3)}</dd></div>
        </dl>
        <p className={`${s.small} ${s.muted}`}>
          A positive αF is added to the original reward on that step; a negative one is subtracted. Φ(s) rises toward 0 as the lander gets closer, slower, more upright and gently on its legs. γ = {SHAPING.gamma}.
        </p>
      </div>
    </Card>
  )
}
