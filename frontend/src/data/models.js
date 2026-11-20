// The three trained agents. Wording follows the project report (Sections 9.3, 10, 11, 12, 13).
export const MODEL_IDS = ['baseline', 'badReward', 'improved']

export const MODELS = {
  baseline: {
    id: 'baseline',
    name: 'Baseline PPO',
    shortName: 'Baseline',
    colorVar: '--color-model-baseline',
    role: 'Reference',
    badgeTone: 'primary',
    trainingReward: 'Original environment reward',
    summary:
      'Trained in the original LunarLander-v3 environment with no reward wrapper. Its results set the reference performance for the other two experiments.',
    modelFile: 'lunar_lander_ppo.zip',
  },
  badReward: {
    id: 'badReward',
    name: 'Bad Reward PPO',
    shortName: 'Bad Reward',
    colorVar: '--color-model-bad-reward',
    role: 'Reward hacking',
    badgeTone: 'warning',
    trainingReward: 'Custom survival-based reward (R_bad)',
    summary:
      'Trained with an intentionally flawed reward from BadRewardWrapper that pays +1 for every step the episode continues, to test whether PPO learns to survive instead of landing.',
    modelFile: 'lunar_lander_bad_reward.zip',
  },
  improved: {
    id: 'improved',
    name: 'Improved Reward PPO',
    shortName: 'Improved',
    colorVar: '--color-model-improved',
    role: 'Reward shaping',
    badgeTone: 'accent',
    trainingReward: 'Original reward + α · F (potential-based shaping)',
    summary:
      'Trained with the original reward plus a potential-based shaping term from ImprovedRewardWrapper, with α = 10 and γ = 0.999.',
    modelFile: 'lunar_lander_improved_reward.zip',
  },
}
