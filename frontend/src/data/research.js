// Content for Model Explorer, Reward Hacking, Reward Shaping, Live Simulation and Research & Docs.
// Every value comes from the project report (section and table numbers are named where used) or from
// the repository files. Nothing here is measured or estimated by this site.

export const PPO_CONFIG = [
  { name: "policy", value: "MlpPolicy, 64 × 64" },
  { name: "n_envs", value: "16 parallel environments" },
  { name: "n_steps", value: "1024" },
  { name: "batch_size", value: "64" },
  { name: "n_epochs", value: "4" },
  { name: "learning_rate", value: "0.0003" },
  { name: "gamma (γ)", value: "0.999" },
  { name: "gae_lambda (λ)", value: "0.98" },
  { name: "clip_range (ε)", value: "0.2" },
  { name: "ent_coef", value: "0.01" },
  { name: "vf_coef", value: "0.5" },
  { name: "max_grad_norm", value: "0.5" },
  { name: "seed", value: "42" },
  { name: "device", value: "CPU" }
];
export const TRAINING_BUDGET = {
  requested: "1,000,000",
  actual: "1,015,808",
  rollouts: 62,
  rolloutSize: "16,384",
  note: "Each rollout holds 16 environments × 1,024 steps = 16,384 transitions. 62 complete rollouts give 1,015,808 timesteps, slightly above the requested budget (report Section 6.4; the progress logs end at 1,015,808).",
  parameters: "9,797"
};
export const OBSERVATIONS = [
  { index: 0, meaning: "Horizontal position x" },
  { index: 1, meaning: "Vertical position y" },
  { index: 2, meaning: "Horizontal velocity vₓ" },
  { index: 3, meaning: "Vertical velocity v_y" },
  { index: 4, meaning: "Angle of the lander" },
  { index: 5, meaning: "Angular velocity" },
  { index: 6, meaning: "Left leg contact (0 or 1)" },
  { index: 7, meaning: "Right leg contact (0 or 1)" }
];
export const ACTIONS = [
  { id: 0, meaning: "Do nothing" },
  { id: 1, meaning: "Fire the left orientation engine" },
  { id: 2, meaning: "Fire the main (bottom) engine" },
  { id: 3, meaning: "Fire the right orientation engine" }
];
export const TRAINING_REWARD = {
  baseline: "Original environment reward",
  badReward: "Custom survival reward R_bad",
  improved: "Original reward + α · F"
};
export const EXTRA_PARAMETER = { baseline: "none", badReward: "none", improved: "α = 10" };
export const BAD_REWARD_RULES = [
  { condition: "Every step on which the episode continues", reward: "+1" },
  { condition: "Terminated with both landing legs in contact with the ground", reward: "+100" },
  { condition: "Terminated without both legs in contact", reward: "−100" },
  { condition: "Truncated by the time limit", reward: "0" }
];
export const BAD_REWARD_NOTE = "The wrapper used the Gymnasium termination and truncation signals; termination takes priority when the reward is chosen.";
export const BAD_REWARD_REMOVED = "R_bad replaces the original reward, so the original fuel cost, distance, speed and angle terms are absent: nothing in R_bad pushes the lander toward the pad or toward a gentle touchdown (report Section 11.4).";
export const HYPOTHESIS = "H₁: Under R_bad, a policy that avoids ground contact for the whole episode obtains a higher return than one that lands, so PPO may learn to stay in the air instead of landing.";
export const HYPOTHESIS_NOTE = "This was a hypothesis to be tested, not a guaranteed outcome. Hovering is a difficult control problem, and PPO might have failed to learn it within the training budget (report Section 11.3).";
export const ILLUSTRATION_DEFAULTS = { landingStep: 378, gamma: 0.999, steps: 1000 };
export const POTENTIAL_WEIGHTS = [
  { symbol: "w_pos", term: "Distance from the pad, √(x² + y²)", value: 1 },
  { symbol: "w_vel", term: "Speed, √(vₓ² + v_y²)", value: 1 },
  { symbol: "w_angle", term: "Absolute angle, |angle|", value: 1 },
  { symbol: "w_angvel", term: "Absolute angular velocity", value: 0.5 },
  { symbol: "w_leg", term: "Leg term, 1 − gentle_legs", value: 0.5 }
];
export const SHAPING = { alpha: 10, gamma: 0.999, gentleSpeedScale: 0.5 };
export const TERMINAL_HANDLING = [
  { situation: "Episode terminated (landing or crash)", potential: "Φ(s′) = 0", reason: "The next state is a true terminal state." },
  { situation: "Episode truncated (1,000-step limit)", potential: "Φ(s′) is the real potential of the next observation", reason: "Truncation is an external time limit, not a natural end of the task." }
];
export const NOT_OUTPERFORM_FACTORS = [
  "the choice of shaping coefficient (α = 10 was fixed and not tuned)",
  "the selected potential weights",
  "the interaction between the shaping term and the original environment reward",
  "the limited training budget"
];
export const REWARD_TYPES = [
  { quantity: "Original reward", meaning: "The reward of the unmodified LunarLander-v3", used: "Yes" },
  { quantity: "Custom reward (Bad)", meaning: "R_bad, defined in report Section 11", used: "No (training and diagnostics only)" },
  { quantity: "Improved reward", meaning: "Original reward + α · F", used: "No (training and diagnostics only)" }
];
export const TOOLS = [
  { tool: "Python", purpose: "Main programming language" },
  { tool: "Google Colab", purpose: "Cloud-based notebook environment" },
  { tool: "Gymnasium", purpose: "Reinforcement learning environment API" },
  { tool: "LunarLander-v3", purpose: "Rocket landing simulation environment" },
  { tool: "Stable-Baselines3", purpose: "PPO implementation" },
  { tool: "PyTorch", purpose: "Deep learning and neural network backend" },
  { tool: "NumPy", purpose: "Numerical computations" },
  { tool: "Pandas", purpose: "Data processing and CSV analysis" },
  { tool: "Matplotlib", purpose: "Data visualization and result graphs" },
  { tool: "Box2D", purpose: "Physics simulation engine" }
];
export const VERSIONS = [
  { name: "gymnasium", value: "1.4.0" },
  { name: "stable-baselines3", value: "2.9.2" },
  { name: "torch", value: "2.14.1+cu130 (GPU available; PPO itself ran on the CPU)" },
  { name: "Python", value: "not recorded in the report" },
  { name: "Video library (MoviePy / imageio)", value: "not recorded in the report" }
];
export const ABSTRACT = [
  "The project investigates how reward design affects the behaviour and performance of reinforcement learning agents, using Gymnasium LunarLander-v3 as the testbed and PPO from Stable-Baselines3 as the algorithm.",
  "Three PPO agents were trained: a Baseline on the original reward, a Bad Reward agent on an intentionally flawed survival-based reward, and an Improved Reward agent on the original reward plus a potential-based shaping term. All three were evaluated in the original, unwrapped environment on seeds 2024–2033 with deterministic actions.",
  "The Baseline landed in 10 of 10 episodes (mean original reward 260.5). The Bad Reward agent timed out in all 10 (mean original reward −599.2) although its custom reward was 999. The Improved Reward agent landed in 9 of 10 (mean original reward 230.2) and did not outperform the Baseline. With ten evaluation episodes and one training run per model, these are experimental observations, not statistically conclusive results."
];
export const BACKGROUND = {
  mdp: "An RL problem is modelled as a Markov Decision Process (S, A, P, R, γ): states, actions, transition probabilities, a reward function and a discount factor γ ∈ [0, 1).",
  returnText: "The discounted return is the sum of future rewards weighted by γ. With γ = 0.999 the effective horizon 1 / (1 − γ) is about 1,000 steps, the same as the LunarLander time limit.",
  endings: "Gymnasium separates terminated (the environment ended the episode, here by landing or crashing) from truncated (an external limit, here 1,000 steps). A truncation is not a real end of the task, so the project handles the two cases separately in the wrappers and in the evaluation.",
  shapingText: "Reward shaping adds a term to guide learning. Careless shaping can change which behaviour is optimal; potential-based shaping is the special form that Ng, Harada and Russell showed preserves the set of optimal policies under the assumptions of their theorem [5]."
};
export const TEX = {
  mdp: String.raw`(\mathcal{S}, \mathcal{A}, P, R, \gamma)`,
  returnG: String.raw`G_t = r_{t+1} + \gamma r_{t+2} + \gamma^2 r_{t+3} + \dots = \sum_{k=0}^{\infty} \gamma^k r_{t+k+1}`,
  objective: String.raw`J(\theta) = \mathbb{E}_{\pi_\theta}\left[G_0\right]`,
  td: String.raw`\delta_t = r_t + \gamma V(s_{t+1}) - V(s_t)`,
  gae: String.raw`\hat{A}_t = \sum_{l=0}^{\infty} (\gamma\lambda)^l \, \delta_{t+l}`,
  ratio: String.raw`\rho_t(\theta) = \frac{\pi_\theta(a_t \mid s_t)}{\pi_{\theta_{\text{old}}}(a_t \mid s_t)}`,
  clip: String.raw`L^{\text{CLIP}}(\theta) = \mathbb{E}\left[\min\left(\rho_t(\theta)\hat{A}_t,\ \operatorname{clip}(\rho_t(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_t\right)\right]`,
  loss: String.raw`L(\theta) = -L^{\text{CLIP}}(\theta) + c_1 L^{\text{VF}}(\theta) - c_2 S[\pi_\theta]`,
  rBad: String.raw`R_{\text{bad}} = \begin{cases} +100 & \text{terminated, both legs in contact} \\ -100 & \text{terminated otherwise} \\ 0 & \text{truncated} \\ +1 & \text{otherwise (episode continues)} \end{cases}`,
  survive: String.raw`G_{\text{survive}} = 999 \times (+1) + 0 = 999`,
  land: String.raw`G_{\text{land}}(L) = (L-1) \times (+1) + 100`,
  shapingF: String.raw`F(s, s') = \gamma\,\Phi(s') - \Phi(s)`,
  shapedReward: String.raw`R_{\text{new}} = R_{\text{original}} + \alpha\,F(s, s'), \qquad \alpha = 10,\ \gamma = 0.999`,
  potential: String.raw`\Phi(s) = -\left[w_{\text{pos}}\,d + w_{\text{vel}}\,v + w_{\text{angle}}\,|\theta| + w_{\text{angvel}}\,|\omega| + w_{\text{leg}}\,(1 - g)\right]`,
  distance: String.raw`d = \sqrt{x^2 + y^2}`,
  speed: String.raw`v = \sqrt{v_x^2 + v_y^2}`,
  gentle: String.raw`g = \frac{\text{left} + \text{right}}{2}\cdot\max\left(0,\ 1 - \frac{v}{0.5}\right)`,
  telescoping: String.raw`\sum_{t=0}^{T-1} \gamma^t F(s_t, s_{t+1}) = \gamma^T \Phi(s_T) - \Phi(s_0)`
};
export const LIMITATIONS_FULL = [
  "Limited evaluation episodes: each model was evaluated over only ten episodes.",
  "Single training run: one run per reward configuration, so the effect of training seeds was not investigated.",
  "No statistical testing: no significance tests or confidence intervals were calculated.",
  "No hyperparameter optimization: the shaping coefficient and potential weights were fixed settings.",
  "Single environment: only LunarLander-v3 was used, so results may not generalize.",
  "Deterministic evaluation: stochastic evaluation was not included.",
  "Limited trajectory analysis: flight trajectories and engine usage were not analysed quantitatively.",
  "Training budget: about one million timesteps requested; full PPO rollouts make the actual count slightly higher (1,015,808).",
  "Environment and software dependence: results may vary with library versions and platforms."
];
export const FUTURE_WORK = [
  "Train each reward configuration with multiple random seeds to measure training variability.",
  "Increase the number of evaluation episodes for more reliable estimates.",
  "Calculate confidence intervals and apply suitable statistical tests.",
  "Experiment with different shaping coefficients and potential weights.",
  "Run ablation studies on the individual terms of the potential function.",
  "Analyse trajectories, altitude, velocity, engine usage and leg contact to understand what the Bad Reward agent learned.",
  "Investigate reward functions that balance survival, landing accuracy and safe touchdown.",
  "Evaluate the agents in other LunarLander configurations.",
  "Compare PPO with other reinforcement learning algorithms.",
  "Develop the React and Flask dashboard for simulating landings interactively (this website is its frontend; the Flask backend is not built yet)."
];
export const REFERENCES = [
  { n: 1, text: "R. S. Sutton and A. G. Barto, Reinforcement Learning: An Introduction, 2nd ed. MIT Press, 2018." },
  { n: 2, text: "J. Schulman, F. Wolski, P. Dhariwal, A. Radford, and O. Klimov, “Proximal Policy Optimization Algorithms,” arXiv:1707.06347, 2017." },
  { n: 3, text: "J. Schulman, S. Levine, P. Abbeel, M. Jordan, and P. Moritz, “Trust Region Policy Optimization,” in Proc. 32nd International Conference on Machine Learning, 2015, pp. 1889–1897." },
  { n: 4, text: "J. Schulman, P. Moritz, S. Levine, M. Jordan, and P. Abbeel, “High-Dimensional Continuous Control Using Generalized Advantage Estimation,” arXiv:1506.02438, 2016." },
  { n: 5, text: "A. Y. Ng, D. Harada, and S. Russell, “Policy invariance under reward transformations: Theory and application to reward shaping,” in Proc. 16th International Conference on Machine Learning, 1999, pp. 278–287." },
  { n: 6, text: "A. Raffin et al., “Stable-Baselines3: Reliable Reinforcement Learning Implementations,” Journal of Machine Learning Research, vol. 22, no. 268, pp. 1–8, 2021." },
  { n: 7, text: "M. Towers et al., “Gymnasium: A Standard Interface for Reinforcement Learning Environments,” arXiv:2407.17032, 2024." },
  { n: 8, text: "D. Amodei et al., “Concrete Problems in AI Safety,” arXiv:1606.06565, 2016." },
  { n: 9, text: "A. Paszke et al., “PyTorch: An Imperative Style, High-Performance Deep Learning Library,” in Advances in Neural Information Processing Systems, vol. 32, 2019." },
  { n: 10, text: "Farama Foundation, “Lunar Lander,” Gymnasium Documentation.", url: "https://gymnasium.farama.org/environments/box2d/lunar_lander/" },
  { n: 11, text: "E. Catto, “Box2D: A 2D Physics Engine.”", url: "https://box2d.org/" }
];
export const DOC_STATUS = [
  "The repository has no notebooks/ folder, so no notebook is linked from this site.",
  "The report does not record the Python version or which video library (MoviePy or imageio) was used.",
  "The report marks a few items “[CONFIRM]” and refers to an Appendix A that is not in the document.",
  "The repository does not state which model and seed produced lunar_lander_success.mp4.",
  "The report’s cover page is formatted as a degree submission. This website presents the work as a personal research project and uses the report only as a source of facts."
];
export const TOTAL_NOTE = "Only three agents were trained, one run each.";
