import PagePlaceholder from '../components/layout/PagePlaceholder.jsx'

export default function ModelExplorerPage() {
  return (
    <PagePlaceholder
      eyebrow="Models"
      title="Model Explorer"
      description="Browse the Baseline, Bad Reward and Improved models and how they were configured."
      planned={[
        'One card or tab per model: configuration, reward definition and file names',
        'A shared PPO configuration table',
        'Side-by-side model comparison',
      ]}
      note="Later, model metadata and downloads may come from the Flask backend."
    />
  )
}
