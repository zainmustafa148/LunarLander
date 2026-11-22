import { ILLUSTRATION_DEFAULTS } from '../data/research.js'

const STEP_LIMIT = ILLUSTRATION_DEFAULTS.steps

// Returns under R_bad (report Section 11.4). Surviving to truncation: +1 on 999 steps, 0 on the last.
// Landing at step L: +1 on L-1 steps, then +100 when the episode terminates with both legs down.
export function badRewardReturns(landingStep, gamma) {
  const discount = (rewards) => rewards.reduce((sum, reward, k) => sum + reward * gamma ** k, 0)
  const survive = [...Array(STEP_LIMIT - 1).fill(1), 0]
  const land = [...Array(landingStep - 1).fill(1), 100]
  return {
    surviveRaw: survive.reduce((a, b) => a + b, 0),
    surviveDiscounted: discount(survive),
    landRaw: land.reduce((a, b) => a + b, 0),
    landDiscounted: discount(land),
  }
}
