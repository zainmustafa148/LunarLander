import PagePlaceholder from '../components/layout/PagePlaceholder.jsx'

export default function ResultsPage() {
  return (
    <PagePlaceholder
      eyebrow="Evaluation"
      title="Results & Analytics"
      description="Evaluation results for the three models, with their limitations stated."
      planned={[
        'The main results table and differences between models',
        'Mean reward with standard deviation, mean episode length and outcome charts',
        'An original versus custom reward panel',
      ]}
      note="Per-episode and training-curve charts will appear only once real data is available."
    />
  )
}
