import PageBody from '../components/layout/PageBody.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import ResearchDocs from '../features/docs/ResearchDocs.jsx'

export default function ResearchDocsPage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Documentation"
        title="Research & Docs"
        description="Methodology, environment, algorithm, reward functions, evaluation, limitations and the files behind the project."
      />
      <ResearchDocs />
    </PageBody>
  )
}
