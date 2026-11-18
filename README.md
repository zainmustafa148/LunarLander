# LunarLander-v3: Reward Hacking and Potential-Based Reward Shaping in PPO

A Reinforcement Learning research project exploring reward hacking in Proximal Policy Optimization (PPO) and investigating Potential-Based Reward Shaping as an approach to improve agent behavior in Gymnasium's LunarLander-v3 environment.

## Project Overview

This project investigates how reward design influences the behavior of a Reinforcement Learning agent.

Three PPO agents were trained and evaluated:

1. **Baseline PPO:** Trained using the original environment reward.
2. **Bad Reward PPO:** Trained using an intentionally flawed reward function to demonstrate reward hacking.
3. **Improved Reward PPO:** Trained using Potential-Based Reward Shaping (PBRS) combined with the original environment reward.

The objective was to compare their behavior and performance using the original environment reward.

## Research Objectives

- Understand reward hacking in Reinforcement Learning.
- Train a baseline PPO agent.
- Demonstrate how a poorly designed reward function can produce unintended behavior.
- Apply Potential-Based Reward Shaping.
- Compare all three agents using consistent evaluation conditions.
- Analyze landing success, crashes, timeouts, and episode rewards.

## Technologies Used

- Python
- Gymnasium (LunarLander-v3)
- Stable-Baselines3
- Proximal Policy Optimization (PPO)
- NumPy
- Matplotlib
- Google Colab
- Jupyter Notebook

## Environment Details

- Environment: LunarLander-v3
- Observation Space: 8-dimensional
- Action Space: 4 discrete actions
- Algorithm: PPO
- Neural Network: MLP with 64 × 64 hidden layers
- Parallel Environments: 16
- Training Timesteps: Approximately 1 million per agent
- Evaluation: 10 episodes per agent

## Experimental Results

All three agents were evaluated using the original LunarLander-v3 environment reward.

| Metric | Baseline PPO | Bad Reward PPO | Improved Reward PPO |
|---|---:|---:|---:|
| Mean Original Reward | 260.5 | -599.2 | 230.2 |
| Reward Standard Deviation | 19.7 | 15.5 | 72.3 |
| Mean Episode Length | 377.6 | 1000.0 | 411.7 |
| Successful Landings | 10/10 | 0/10 | 9/10 |
| Crashes | 0 | 0 | 1 |
| Timeouts | 0 | 10 | 0 |

## Key Findings

### 1. Baseline PPO
The baseline agent achieved the highest mean original reward of 260.5 and successfully landed in all 10 evaluation episodes.

### 2. Bad Reward PPO
The intentionally flawed reward function encouraged unintended behavior. The agent achieved a mean custom reward of 999 but failed to land in all 10 evaluation episodes and timed out each time.

This demonstrates how an agent can optimize a poorly designed reward signal without achieving the intended task.

### 3. Improved Reward PPO
Potential-Based Reward Shaping significantly improved behavior compared with the bad reward agent. It achieved 9 successful landings out of 10 and a mean original reward of 230.2.

However, it did not outperform the baseline agent.

## Potential-Based Reward Shaping

The shaping reward was calculated using:

**F(s, s') = γΦ(s') − Φ(s)**

The updated reward was:

**R_new = R_original + αF(s, s')**

Where:
- γ = 0.999
- α = 10
- Φ(s) represents the state potential function.

## Repository Structure

```text
LunarLander/
├── models/
│   ├── lunar_lander_ppo.zip
│   ├── lunar_lander_bad_reward.zip
│   └── lunar_lander_improved_reward.zip
├── notebooks/
├── results/
│   ├── data/
│   ├── graphs/
│   └── videos/
├── report/
└── README.md
```

## How to Load a Trained Model

Install the required libraries:

```bash
pip install stable-baselines3 gymnasium[box2d]
```

Load a trained PPO model:

```python
from stable_baselines3 import PPO

model = PPO.load("models/lunar_lander_ppo.zip")
```

You can replace the filename to load either the bad reward or improved reward model.

## Limitations

- Each model was evaluated over 10 episodes.
- Only one training run was conducted per model.
- Results may vary with different random seeds and training configurations.
- The improved reward agent did not outperform the baseline agent.
- More experiments are required to establish stronger statistical conclusions.

## Conclusion

This project demonstrates that reward design plays an important role in Reinforcement Learning. The bad reward experiment illustrates reward hacking, while Potential-Based Reward Shaping provides a structured approach to guiding agent behavior.

The baseline agent achieved the best overall evaluation performance in these experiments.

## Author

**Zain Mustafa**

GitHub: [@zainmustafa148](https://github.com/zainmustafa148)

## License

Add a license if you intend to specify permissions for reuse and distribution.
