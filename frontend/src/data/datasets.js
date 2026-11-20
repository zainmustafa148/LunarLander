// Registry of the research datasets that scripts/csv-to-json.mjs writes to public/data/.
// Keep `required` in sync with CSV_FILES in that script.

// Every series the app plots has exactly one kind. Comparisons between models may only use
// 'original'. Custom and shaped rewards are each model's own training objective: they live on
// their own scales and are drawn in separate charts.
export const REWARD_KINDS = Object.freeze({
  ORIGINAL: 'original',
  CUSTOM: 'custom',
  SHAPED: 'shaped',
  SHAPING: 'shaping',
})

const dataset = (name, required = []) => ({
  file: `${name}.json`,
  source: `results/data/${name}.csv`,
  required,
})

export const DATASETS = {
  evalSummary: dataset('phase3_comparison_summary', [
    'model', 'mean_original_reward', 'std_original_reward', 'mean_length', 'landed', 'crashed', 'timeout', 'solved_200',
  ]),
  evalPerEpisode: dataset('phase3_comparison_per_episode', [
    'model', 'episode', 'seed', 'original_reward', 'length', 'outcome',
  ]),
  badEvalCustom: dataset('bad_reward_eval_custom_env', [
    'episode', 'seed', 'custom_reward', 'original_reward', 'length', 'outcome_original_rule', 'wrapper_landing_bonus', 'terminated', 'truncated',
  ]),
  badEvalOriginal: dataset('bad_reward_eval_original_env', [
    'episode', 'seed', 'original_reward', 'length', 'outcome', 'terminated', 'truncated',
  ]),
  improvedEvalImproved: dataset('improved_reward_eval_improved_env', [
    'episode', 'seed', 'improved_reward', 'original_reward', 'shaping_return', 'length', 'outcome', 'terminated', 'truncated',
  ]),
  improvedEvalOriginal: dataset('improved_reward_eval_original_env', [
    'episode', 'seed', 'original_reward', 'length', 'outcome', 'terminated', 'truncated',
  ]),
  trainBaseline: dataset('training_episodes_log', ['r', 'l', 't', 'timesteps', 'reward_ma100']),
  trainBad: dataset('bad_reward_training_episodes_log', [
    'r', 'l', 't', 'original_episode_return', 'landed_by_wrapper', 'timesteps',
  ]),
  trainImproved: dataset('improved_reward_training_episodes_log', [
    'r', 'l', 't', 'original_episode_return', 'shaping_episode_return', 'timesteps',
  ]),
  progressBaseline: dataset('training_progress_log'),
  progressBad: dataset('bad_reward_training_progress_log'),
  progressImproved: dataset('improved_reward_training_progress_log'),
}

// How the model names in the CSV files map to the app's model ids.
export const CSV_MODEL_IDS = {
  'Baseline PPO': 'baseline',
  'Bad Reward PPO': 'badReward',
  'Improved Reward PPO': 'improved',
}

// Number of episodes in the moving average that this app calculates for the training charts.
export const AVERAGE_WINDOW = 50

// Stable arrays: they key the data store's cache, so they must not be recreated per render.
export const EPISODE_DATASETS = ['evalPerEpisode']
export const ORIGINAL_TRAINING_DATASETS = ['trainBaseline', 'trainBad', 'trainImproved']

// Training curves that compare models. ORIGINAL reward only.
//   baseline  : `r` is the original environment reward (its environment is unwrapped).
//   badReward : `r` is the custom reward, so the original reward is `original_episode_return`.
//   improved  : `r` is the improved-environment reward, so the original reward is
//               `original_episode_return`.
export const ORIGINAL_TRAINING_SERIES = [
  {
    id: 'baseline',
    modelId: 'baseline',
    dataset: 'trainBaseline',
    column: 'r',
    kind: REWARD_KINDS.ORIGINAL,
    recorded: { column: 'reward_ma100', label: 'Baseline recorded 100-episode average (reward_ma100)' },
  },
  {
    id: 'badReward',
    modelId: 'badReward',
    dataset: 'trainBad',
    column: 'original_episode_return',
    kind: REWARD_KINDS.ORIGINAL,
  },
  {
    id: 'improved',
    modelId: 'improved',
    dataset: 'trainImproved',
    column: 'original_episode_return',
    kind: REWARD_KINDS.ORIGINAL,
  },
]

// Training objectives: each model's own reward, never compared across models.
export const OBJECTIVE_SERIES = {
  badCustom: {
    id: 'badCustom',
    modelId: 'badReward',
    dataset: 'trainBad',
    datasetIds: ['trainBad'],
    column: 'r',
    kind: REWARD_KINDS.CUSTOM,
    title: 'Bad Reward PPO: custom survival reward',
    badge: 'Custom reward',
    subtitle:
      'Reward under the flawed training objective (column r). Its scale is not comparable with original reward or with any other chart.',
    footnote:
      'Source: column r of bad_reward_training_episodes_log. In this log r reaches 999 in 1,000-step episodes; it does not measure landing.',
  },
  improvedShaped: {
    id: 'improvedShaped',
    modelId: 'improved',
    dataset: 'trainImproved',
    datasetIds: ['trainImproved'],
    column: 'r',
    kind: REWARD_KINDS.SHAPED,
    title: 'Improved Reward PPO: improved-environment reward',
    badge: 'Shaped reward',
    subtitle:
      'Reward from the improved training environment (column r). Its scale is not comparable with original reward or with the bad-reward objective.',
    footnote:
      'Source: column r of improved_reward_training_episodes_log. The original reward for the same episodes is on the Training curves tab (original_episode_return).',
  },
  improvedShaping: {
    id: 'improvedShaping',
    modelId: 'improved',
    dataset: 'trainImproved',
    datasetIds: ['trainImproved'],
    column: 'shaping_episode_return',
    kind: REWARD_KINDS.SHAPING,
    title: 'Improved Reward PPO: shaping contribution',
    badge: 'Shaping term',
    subtitle: 'Shaping reward accumulated per training episode (column shaping_episode_return), shown on its own scale.',
    footnote: 'Source: column shaping_episode_return of improved_reward_training_episodes_log.',
  },
}

// Guards against mixing reward kinds: charts call this when they are created.
export function assertRewardKinds(series, allowed, chartName) {
  const list = Array.isArray(series) ? series : [series]
  const bad = list.filter((s) => !allowed.includes(s.kind))
  if (bad.length) {
    throw new Error(`${chartName} cannot plot ${bad.map((s) => `${s.id} (${s.kind})`).join(', ')}; allowed: ${allowed.join(', ')}.`)
  }
}
