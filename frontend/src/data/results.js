import { MODEL_IDS } from './models.js'

/*
 * Evaluation results (report Table 9; README; results/data/phase3_comparison_summary.csv).
 * ALL values here are ORIGINAL environment rewards, measured in the unwrapped LunarLander-v3
 * with the original landing rule. Custom training rewards live in CUSTOM_REWARDS below and
 * must never be mixed with these.
 *
 * `std` is the standard deviation of the 10 episode rewards (population form; it reproduces the
 * report's 19.7 / 15.5 / 72.3 from results/data/phase3_comparison_per_episode.csv).
 */
export const EVALUATION = {
  baseline: { meanReward: 260.5, std: 19.7, meanLength: 377.6, landed: 10, crashed: 0, timeouts: 0 },
  badReward: { meanReward: -599.2, std: 15.5, meanLength: 1000.0, landed: 0, crashed: 0, timeouts: 10 },
  improved: { meanReward: 230.2, std: 72.3, meanLength: 411.7, landed: 9, crashed: 1, timeouts: 0 },
}

export const PROTOCOL = {
  episodes: 10,
  seeds: '2024–2033',
  actions: 'deterministic',
  environment: 'original, unwrapped LunarLander-v3',
}

// Reward each agent earned under ITS OWN training objective. Not comparable across models
// and not a landing metric (report Section 14.3, Table 11).
export const CUSTOM_REWARDS = {
  badReward: { mean: 999, note: 'Mean reward under its own flawed objective (all 10 episodes).' },
}

const round1 = (value) => Math.round(value * 10) / 10

// Differences "second minus first" (report Table 10), computed from EVALUATION rather than retyped.
function difference(firstId, secondId) {
  const a = EVALUATION[firstId]
  const b = EVALUATION[secondId]
  return {
    reward: round1(b.meanReward - a.meanReward),
    length: round1(b.meanLength - a.meanLength),
    landings: b.landed - a.landed,
  }
}

export const DIFFERENCES = [
  { id: 'improved-baseline', label: 'Improved − Baseline', ...difference('baseline', 'improved') },
  { id: 'bad-baseline', label: 'Bad Reward − Baseline', ...difference('baseline', 'badReward') },
  { id: 'improved-bad', label: 'Improved − Bad Reward', ...difference('badReward', 'improved') },
]

// Ranking by mean ORIGINAL reward (report Section 14.4), derived from the data.
export const RANKING = [...MODEL_IDS].sort((a, b) => EVALUATION[b].meanReward - EVALUATION[a].meanReward)
