import { SHAPING, POTENTIAL_WEIGHTS } from '../data/research.js'

const WEIGHT = Object.fromEntries(POTENTIAL_WEIGHTS.map((w) => [w.symbol, w.value]))

// Potential function of report Section 12.4. `state` has x, y, vx, vy, angle, angvel, left, right.
export function potentialParts(state) {
  const distance = Math.hypot(state.x, state.y)
  const speed = Math.hypot(state.vx, state.vy)
  const gentleLegs = ((state.left + state.right) / 2) * Math.max(0, 1 - speed / SHAPING.gentleSpeedScale)
  const terms = {
    position: WEIGHT.w_pos * distance,
    velocity: WEIGHT.w_vel * speed,
    angle: WEIGHT.w_angle * Math.abs(state.angle),
    angularVelocity: WEIGHT.w_angvel * Math.abs(state.angvel),
    legs: WEIGHT.w_leg * (1 - gentleLegs),
  }
  const potential = -Object.values(terms).reduce((sum, value) => sum + value, 0)
  return { distance, speed, gentleLegs, terms, potential }
}

// One shaping step: F = γΦ(s′) − Φ(s); Φ(s′) is 0 when the episode terminated (report Table 6).
export function shapingStep(state, next, terminated, gamma = SHAPING.gamma, alpha = SHAPING.alpha) {
  const current = potentialParts(state)
  const following = potentialParts(next)
  const nextPotential = terminated ? 0 : following.potential
  const f = gamma * nextPotential - current.potential
  return { current, following, nextPotential, f, scaled: alpha * f }
}
