import PagePlaceholder from '../components/layout/PagePlaceholder.jsx'

export default function LiveSimulationPage() {
  return (
    <PagePlaceholder
      eyebrow="Simulation"
      title="Live Simulation"
      description="Watch a trained model fly the lander, with live telemetry."
      planned={[
        'Model and seed selectors with run, stop and reset controls',
        'A frame viewer',
        'Telemetry for the 8 observations, plus action and reward',
      ]}
      note="Controls will stay disabled until the Flask backend is connected. No physics is re-implemented in JavaScript, so there will be no fake simulation."
    />
  )
}
