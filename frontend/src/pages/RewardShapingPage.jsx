import PagePlaceholder from '../components/layout/PagePlaceholder.jsx'

export default function RewardShapingPage() {
  return (
    <PagePlaceholder
      eyebrow="Experiment"
      title="Reward Shaping"
      description="Potential-based reward shaping (PBRS) and how it compares with the bad reward."
      planned={[
        'PBRS explainer: formula, telescoping and terminated versus truncated',
        'A potential explorer with sliders for the 8 observation values, using the report’s exact formula and weights',
        'Side-by-side comparison of the Bad and Improved wrappers',
      ]}
    />
  )
}
