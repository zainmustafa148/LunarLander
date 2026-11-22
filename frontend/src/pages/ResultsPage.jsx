import PageBody from '../components/layout/PageBody.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import ResultsAnalytics from '../features/results/ResultsAnalytics.jsx'

export default function ResultsPage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Evaluation"
        title="Results & Analytics"
        description="Evaluation results for the three models, with their limitations stated."
      />
      <ResultsAnalytics />
    </PageBody>
  )
}
