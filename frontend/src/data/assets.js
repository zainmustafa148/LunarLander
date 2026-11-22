import { assetUrl } from '../utils/assetUrl.js'

// Files shipped with the site (copies in public/) and where they come from.
// Originals stay in the repository: report/, results/graphs/, results/videos/, results/data/, models/.
const REPO = 'https://github.com/zainmustafa148/LunarLander'
export const repoFile = (path) => `${REPO}/blob/main/${path}`
export const repoFolder = (path) => `${REPO}/tree/main/${path}`

export const REPORT = {
  title: 'LunarLander PPO Project Report',
  file: 'LunarLander_PPO_Project_Report.docx',
  localUrl: assetUrl('report/LunarLander_PPO_Project_Report.docx'),
  repoUrl: repoFile('report/LunarLander_PPO_Project_Report.docx'),
  note: 'Word document (.docx), 1.9 MB.',
}

// Graphs from results/graphs, plus three figures that appear only inside the report document and were
// extracted from it unchanged (word/media/*.png).
export const FIGURES = {
  pipeline: {
    src: assetUrl('graphs/report_figure_1_pipeline.png'),
    width: 1156,
    height: 1179,
    title: 'Report Figure 1: experimental pipeline',
    alt: 'Block diagram of the pipeline. Gymnasium LunarLander-v3 feeds three PPO agents (Baseline with no wrapper, Bad Reward with BadRewardWrapper, Improved Reward with ImprovedRewardWrapper). They share a Monitor, 16 parallel environments and PPO with an MlpPolicy of 64 by 64, gamma 0.999, seed 42 and 1,000,000 requested timesteps. Saved models and logs go to a common evaluation harness in the original environment with seeds 2024 to 2033, 10 episodes, deterministic actions and one landing rule.',
    source: 'Extracted from the report (Figure 1).',
  },
  baselineTraining: {
    src: assetUrl('graphs/training_reward_graph.png'),
    repoUrl: repoFile('results/graphs/training_reward_graph.png'),
    width: 1650,
    height: 2250,
    title: 'Report Figure 2: Baseline PPO training reward',
    alt: 'Training graphs for the Baseline PPO agent: original reward per training episode with a moving average, plus episode length, plotted against timesteps.',
    source: 'results/graphs/training_reward_graph.png',
  },
  badTraining: {
    src: assetUrl('graphs/bad_reward_training_graph.png'),
    repoUrl: repoFile('results/graphs/bad_reward_training_graph.png'),
    width: 1650,
    height: 1950,
    title: 'Report Figure 3: Bad Reward PPO training graphs',
    alt: 'Training graphs for the Bad Reward PPO agent: custom reward and original reward of the same episodes, plus episode length, plotted against timesteps.',
    source: 'results/graphs/bad_reward_training_graph.png',
  },
  badEval: {
    src: assetUrl('graphs/bad_reward_eval_graph.png'),
    repoUrl: repoFile('results/graphs/bad_reward_eval_graph.png'),
    width: 1950,
    height: 675,
    title: 'Report Figure 3: Bad Reward PPO evaluation graph',
    alt: 'Evaluation graph for the Bad Reward PPO agent over its ten evaluation episodes, comparing custom reward with original reward.',
    source: 'results/graphs/bad_reward_eval_graph.png',
  },
  hackingComparison: {
    src: assetUrl('graphs/reward_hacking_comparison.png'),
    repoUrl: repoFile('results/graphs/reward_hacking_comparison.png'),
    width: 2100,
    height: 720,
    title: 'Report Figure 6: reward-hacking comparison',
    alt: 'Reward-hacking comparison graph from the Bad Reward experiment.',
    source: 'results/graphs/reward_hacking_comparison.png',
  },
  improvedTraining: {
    src: assetUrl('graphs/report_figure_4_improved_training.png'),
    width: 1650,
    height: 1800,
    title: 'Report Figure 4: Improved Reward PPO training curves',
    alt: 'Three training graphs for the Improved Reward PPO agent against timesteps: the improved reward (original plus shaping), the original reward of the same episodes, and episode length, each with a 100-episode moving average.',
    source: 'Extracted from the report (Figure 4).',
  },
  comparison: {
    src: assetUrl('graphs/report_figure_5_model_comparison.png'),
    width: 1379,
    height: 985,
    title: 'Report Figure 5: three-model comparison',
    alt: 'Four panels comparing the three models on the original reward: per-episode reward, mean reward with standard deviation, mean episode length, and outcome counts out of 10 episodes.',
    source: 'Extracted from the report (Figure 5).',
  },
}

export const VIDEOS = {
  badReward: {
    src: assetUrl('media/bad_reward_episode_1.mp4'),
    repoUrl: repoFile('results/videos/bad_reward_episode_1.mp4'),
    title: 'Bad Reward PPO, episode 1',
    caption:
      'A recorded Bad Reward PPO episode (file bad_reward_episode_1.mp4, 20 seconds). The evaluation logs classify every Bad Reward episode as a timeout; this recording is shown as it is, and no flight behaviour is claimed from it.',
    durationLabel: '20 s',
  },
  success: {
    src: assetUrl('media/lunar_lander_success.mp4'),
    repoUrl: repoFile('results/videos/lunar_lander_success.mp4'),
    title: 'Successful landing',
    caption:
      'A recorded successful landing (file lunar_lander_success.mp4, 7 seconds). The repository does not state which model or seed was recorded, so none is claimed here.',
    durationLabel: '7 s',
  },
}

// The 12 research CSVs (README table). Each has a converted JSON copy in public/data.
export const DATASET_FILES = [
  ['phase3_comparison_summary', 'Summary of experimental results (3 models)'],
  ['phase3_comparison_per_episode', 'Per-episode comparison of all three agents (original reward)'],
  ['training_episodes_log', 'Baseline training episode logs'],
  ['training_progress_log', 'Baseline training progress'],
  ['bad_reward_eval_custom_env', 'Bad reward evaluation in the custom environment'],
  ['bad_reward_eval_original_env', 'Bad reward evaluation in the original environment'],
  ['bad_reward_training_episodes_log', 'Bad reward training episode logs'],
  ['bad_reward_training_progress_log', 'Bad reward training progress'],
  ['improved_reward_eval_improved_env', 'Improved reward evaluation in the shaped environment'],
  ['improved_reward_eval_original_env', 'Improved reward evaluation in the original environment'],
  ['improved_reward_training_episodes_log', 'Improved reward training episode logs'],
  ['improved_reward_training_progress_log', 'Improved reward training progress'],
].map(([name, description]) => ({
  name,
  description,
  csvUrl: repoFile(`results/data/${name}.csv`),
  jsonUrl: assetUrl(`data/${name}.json`),
}))

export const MODEL_FILES = {
  baseline: { file: 'lunar_lander_ppo.zip', url: repoFile('models/lunar_lander_ppo.zip') },
  badReward: { file: 'lunar_lander_bad_reward.zip', url: repoFile('models/lunar_lander_bad_reward.zip') },
  improved: { file: 'lunar_lander_improved_reward.zip', url: repoFile('models/lunar_lander_improved_reward.zip') },
}

export const REPO_LINKS = {
  readme: repoFile('README.md'),
  repo: REPO,
  notebooksFolder: repoFolder('notebooks'),
}
