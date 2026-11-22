import PageBody from '../components/layout/PageBody.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import LiveSimulation from '../features/simulation/LiveSimulation.jsx'

export default function LiveSimulationPage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Simulation"
        title="Live Simulation"
        description="Run a trained model in LunarLander-v3 and watch its state. This needs the Flask backend, which is not built yet."
      />
      <LiveSimulation />
    </PageBody>
  )
}
