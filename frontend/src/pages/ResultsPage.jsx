import PageHeader from '../components/layout/PageHeader.jsx'
import Phase5Preview from '../features/results/Phase5Preview.jsx'

// Phase 5: shows a temporary chart preview. Phase 6 replaces it with the final page.
// (The original placeholder version of this file is in git history.)
export default function ResultsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Evaluation"
        title="Results & Analytics"
        description="Evaluation results for the three models, with their limitations stated."
      />
      <Phase5Preview />
    </>
  )
}
