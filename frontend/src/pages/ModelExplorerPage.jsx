import PageBody from '../components/layout/PageBody.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import ModelExplorer from '../features/models/ModelExplorer.jsx'

export default function ModelExplorerPage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Models"
        title="Model Explorer"
        description="The three PPO agents: how each was trained, which reward it used and how it performed in the original environment."
      />
      <ModelExplorer />
    </PageBody>
  )
}
