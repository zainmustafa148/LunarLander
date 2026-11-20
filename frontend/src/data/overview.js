// Overview-page text, taken from the project report (Abstract, Sections 2–4, 9–14, 16).

export const PROJECT = {
  eyebrow: 'Personal AI/ML research project',
  title: 'Training an AI Agent to Land a Rocket',
  subtitle: 'Proximal Policy Optimization, reward hacking and potential-based reward shaping in LunarLander-v3',
  introduction: [
    'This project investigates how reward design affects the behaviour and performance of reinforcement learning agents. Gymnasium’s LunarLander-v3 is the testbed, and the agents are trained with Proximal Policy Optimization (PPO) from Stable-Baselines3.',
    'In reinforcement learning the reward function is the only channel through which the designer communicates the goal. When the reward does not faithfully express the real goal, an agent can score highly by behaving in unintended ways. This is called reward hacking, or specification gaming.',
  ],
  researchQuestion:
    'How do (a) a flawed, survival-based reward and (b) a potential-based shaped reward change the behaviour of a PPO agent in LunarLander-v3, compared with training on the original reward, when all agents are judged with the original reward and landing rule?',
  objectives: [
    'Train a PPO agent on LunarLander-v3 with the original reward and establish a baseline.',
    'Implement a custom Gymnasium wrapper (BadRewardWrapper) with an intentionally flawed reward and test the hypothesis that it encourages staying alive instead of landing.',
    'Implement a potential-based reward-shaping wrapper (ImprovedRewardWrapper) that preserves the original reward and handles terminated and truncated correctly.',
    'Train three PPO models under identical algorithm settings so that the reward is the only experimental difference.',
    'Evaluate all models fairly in the original environment: same seeds, same deterministic protocol, same landing rule.',
    'Report the results honestly, including the limitations of a small evaluation.',
  ],
  facts: [
    { label: 'Environment', value: 'LunarLander-v3 (discrete actions)' },
    { label: 'Algorithm', value: 'PPO, Stable-Baselines3' },
    { label: 'Agents trained', value: '3 (one training run each)' },
    { label: 'Evaluation', value: '10 episodes, seeds 2024–2033' },
  ],
  principle:
    'All final comparisons use only the original environment reward and the original landing rule. Custom rewards are used for training but are never treated as measures of landing performance.',
  landingRule: [
    { outcome: 'Successful landing', rule: 'Episode terminated and the final original reward was +100.' },
    { outcome: 'Crash', rule: 'Episode terminated and the final original reward was −100.' },
    { outcome: 'Timeout', rule: 'Episode truncated at the 1,000-step time limit.' },
  ],
}

// Identical across all three experiments (report Tables 1 and 7).
export const SHARED_CONFIG = [
  { label: 'Policy', value: 'MlpPolicy, 64 × 64 hidden layers' },
  { label: 'Parallel environments', value: '16' },
  { label: 'Requested timesteps', value: '1,000,000' },
  { label: 'Learning rate', value: '0.0003' },
  { label: 'Discount factor γ', value: '0.999' },
  { label: 'n_steps / batch size', value: '1024 / 64' },
  { label: 'Random seed', value: '42' },
]

export const EXPERIMENTS = [
  {
    id: 'baseline',
    modelId: 'baseline',
    number: 1,
    title: 'Baseline',
    to: '/models',
    question: 'What does PPO achieve when trained on the original LunarLander-v3 reward?',
    setup: [
      'Trained in the original environment with no custom reward wrapper.',
      'The original reward was used throughout training.',
    ],
    outcome:
      'Mean original reward 260.5 (std 19.7), 10 of 10 successful landings and a mean episode length of 377.6 steps. These results are the reference for the remaining experiments.',
  },
  {
    id: 'reward-hacking',
    modelId: 'badReward',
    number: 2,
    title: 'Reward hacking',
    to: '/reward-hacking',
    question: 'Does a reward that pays for staying alive teach PPO to survive instead of landing?',
    hypothesis:
      'H₁: Under R_bad, a policy that avoids ground contact for the whole episode obtains a higher return than one that lands, so PPO may learn to stay in the air instead of landing.',
    setupTitle: 'The flawed reward, R_bad',
    setup: [
      '+1 for every timestep in which the episode continues.',
      '+100 when the episode terminates with both landing legs in contact with the ground.',
      '−100 when it terminates without both legs in contact.',
      '0 when the episode is truncated by the time limit.',
    ],
    illustration:
      'Illustration only (calculated, not measured): surviving all 1,000 steps returns 999 under R_bad, while a landing after about 378 steps would return 477.',
    outcome:
      'All 10 evaluation episodes reached the 1,000-step time limit: 0 landings, 0 crashes, 10 timeouts. The mean original reward was −599.2 (std 15.5), while the mean reward under its own custom objective was 999.',
    caveat:
      'The numbers alone do not show how the agent flew. No specific flight behaviour is claimed without trajectory or video analysis.',
  },
  {
    id: 'reward-shaping',
    modelId: 'improved',
    number: 3,
    title: 'Potential-based reward shaping',
    to: '/reward-shaping',
    question: 'Can a potential-based shaping term guide learning while keeping the original reward?',
    formula: 'R_new = R_original + α · [γΦ(s′) − Φ(s)],   α = 10,  γ = 0.999',
    setupTitle: 'How the shaping term works',
    setup: [
      'The original reward is preserved; the shaping term is added to it.',
      'Φ(s) scores a state from the lander’s position, velocity, angle, angular velocity and leg contact.',
      'When an episode terminates, Φ(s′) is set to 0. When it is truncated by the time limit, the real Φ(s′) is kept.',
      'α = 10 was a fixed setting. It was not tuned and no other values were compared.',
    ],
    outcome:
      'Mean original reward 230.2 (std 72.3), 9 of 10 successful landings, 1 crash and 0 timeouts. The mean original reward is 30.3 lower than the Baseline.',
  },
]

export const FINDINGS = [
  {
    id: 'baseline-best',
    tone: 'primary',
    label: 'Best overall',
    title: 'Baseline PPO achieved the best overall evaluation performance.',
    detail:
      'It had the highest mean original reward (260.5), landed in all 10 episodes and had the shortest mean episode length (377.6 steps).',
  },
  {
    id: 'reward-hacking',
    tone: 'warning',
    label: 'Reward hacking',
    title: 'Bad Reward PPO demonstrated reward hacking.',
    detail:
      'Its custom reward was high (999 under its own objective), but it failed to land in all 10 episodes and timed out every time, with a mean original reward of −599.2.',
  },
  {
    id: 'recovery',
    tone: 'accent',
    label: 'Recovered',
    title: 'Improved Reward PPO recovered strongly but did not outperform Baseline PPO.',
    detail:
      'It landed 9 of 10 times with a mean original reward of 230.2, far above the Bad Reward agent but 30.3 below the Baseline.',
  },
  {
    id: 'objective-vs-metric',
    tone: 'neutral',
    label: 'Method',
    title: 'Training reward is not evaluation performance.',
    detail:
      'Ranking the agents by their own training rewards would have been misleading. Every agent was therefore evaluated with the original reward and the same landing rule.',
  },
]

export const CAVEAT =
  'Each model was evaluated over only ten episodes and trained in a single run, so these findings are experimental observations, not statistically conclusive evidence that one reward design is universally better.'

// Report Section 16.
export const LIMITATIONS = [
  'Limited evaluation episodes: each model was evaluated over only ten episodes.',
  'Single training run: one run per reward configuration, so the effect of training seeds was not investigated.',
  'No statistical testing: no significance tests or confidence intervals were calculated.',
  'No hyperparameter optimization: the shaping coefficient and potential weights were fixed settings.',
  'Single environment: only LunarLander-v3 was used, so results may not generalize.',
  'Deterministic evaluation: stochastic evaluation was not included.',
  'Limited trajectory analysis: flight trajectories and engine usage were not analysed quantitatively.',
  'Training budget: about one million timesteps requested; full PPO rollouts make the actual count slightly higher.',
  'Environment and software dependence: results may vary with library versions and platforms.',
]
