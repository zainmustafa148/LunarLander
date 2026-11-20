import PagePlaceholder from '../components/layout/PagePlaceholder.jsx'

export default function RewardHackingPage() {
  return (
    <PagePlaceholder
      eyebrow="Experiment"
      title="Reward Hacking"
      description="How a poorly designed reward can teach an agent to exploit it instead of landing."
      planned={[
        'The reward rule and the hypothesis H₁',
        'An interactive return calculator (survive versus land after N steps, with γ), labelled illustrative, not measured',
        'The measured outcome',
        'Original and custom rewards kept clearly separate',
      ]}
    />
  )
}
