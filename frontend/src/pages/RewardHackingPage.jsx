import PageBody from '../components/layout/PageBody.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import RewardHacking from '../features/hacking/RewardHacking.jsx'

export default function RewardHackingPage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Experiment 2"
        title="Reward Hacking Demonstration"
        description="What happens when a reward pays for staying alive: the agent scored 999 on its own reward and landed in none of its ten evaluation episodes."
      />
      <RewardHacking />
    </PageBody>
  )
}
