import PageBody from '../components/layout/PageBody.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import RewardShaping from '../features/shaping/RewardShaping.jsx'

export default function RewardShapingPage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Experiment 3"
        title="Reward Shaping"
        description="Potential-based shaping added to the original reward: the formula, the weights, what was measured, and why it did not beat the Baseline."
      />
      <RewardShaping />
    </PageBody>
  )
}
