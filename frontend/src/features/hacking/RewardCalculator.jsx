import { useId, useState } from 'react'
import Callout from '../../components/ui/Callout.jsx'
import Card from '../../components/ui/Card.jsx'
import Formula from '../../components/math/Formula.jsx'
import { ILLUSTRATION_DEFAULTS, TEX } from '../../data/research.js'
import { badRewardReturns } from '../../utils/badReward.js'
import { formatNumber } from '../../utils/format.js'
import s from '../shared/shared.module.css'
import styles from './hacking.module.css'

export default function RewardCalculator() {
  const [landingStep, setLandingStep] = useState(ILLUSTRATION_DEFAULTS.landingStep)
  const [gamma, setGamma] = useState(ILLUSTRATION_DEFAULTS.gamma)
  const id = useId()
  const result = badRewardReturns(landingStep, gamma)
  const isReportCase = landingStep === ILLUSTRATION_DEFAULTS.landingStep && gamma === ILLUSTRATION_DEFAULTS.gamma
  const surviveWins = result.surviveRaw > result.landRaw
  const discountedWins = result.surviveDiscounted > result.landDiscounted

  return (
    <Card>
      <div className={s.stack}>
        <Callout title="Illustration, not a measurement">
          This calculator applies the rules of R_bad to two imagined episodes. It does not use any trained model or evaluation data. With the defaults it reproduces report Table 5 (landing after about 378 steps, which is roughly the Baseline&apos;s mean episode length).
        </Callout>
        <Formula tex={TEX.survive} label="Surviving until truncation returns 999 times plus 1 plus 0, which is 999." />
        <Formula tex={TEX.land} label="Landing at step L returns L minus 1 times plus 1, plus 100." />
        <div className={styles.controls}>
          <div className={styles.control}>
            <label htmlFor={`${id}-step`}>Imagined landing step L: <strong>{landingStep}</strong></label>
            <input id={`${id}-step`} type="range" min="50" max="999" step="1" value={landingStep} onChange={(event) => setLandingStep(Number(event.target.value))} />
          </div>
          <div className={styles.control}>
            <label htmlFor={`${id}-gamma`}>Discount factor γ: <strong>{gamma.toFixed(4)}</strong></label>
            <input id={`${id}-gamma`} type="range" min="0.99" max="0.9999" step="0.0001" value={gamma} onChange={(event) => setGamma(Number(event.target.value))} />
          </div>
        </div>
        <div className={styles.compare}>
          <div className={styles.option}>
            <h4>Survive all 1,000 steps</h4>
            <p className={styles.big}>{formatNumber(result.surviveRaw, 0)}</p>
            <p className={s.muted}>discounted: {formatNumber(result.surviveDiscounted)}</p>
          </div>
          <div className={styles.option}>
            <h4>Land at step {landingStep}</h4>
            <p className={styles.big}>{formatNumber(result.landRaw, 0)}</p>
            <p className={s.muted}>discounted: {formatNumber(result.landDiscounted)}</p>
          </div>
        </div>
        <p className={s.cardText} aria-live="polite">
          Under R_bad, surviving returns {surviveWins ? 'more' : 'less'} than landing at step {landingStep} (undiscounted), and {discountedWins ? 'more' : 'less'} when discounted with γ = {gamma.toFixed(4)}.
          {isReportCase && ' These match report Table 5: 999 and about 631.9 for surviving, 477 and about 382.8 for landing.'}
        </p>
        <p className={`${s.small} ${s.muted}`}>
          This shows why the reward can favour survival. Whether the trained agent actually learned to survive that way is a separate question, answered only by the evaluation data below.
        </p>
      </div>
    </Card>
  )
}
