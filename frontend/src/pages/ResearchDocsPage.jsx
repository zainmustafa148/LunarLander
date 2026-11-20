import PagePlaceholder from '../components/layout/PagePlaceholder.jsx'

export default function ResearchDocsPage() {
  return (
    <PagePlaceholder
      eyebrow="Documentation"
      title="Research & Docs"
      description="The original research report, presented as readable website content."
      planned={[
        'The original report organized into sections: abstract, introduction, objectives, background, PPO, environment, methodology, experiments, results, discussion, limitations, conclusion and references',
        'Sticky section navigation',
        'Formulas rendered with KaTeX',
        'Access to the original report document',
        'The report’s graphs, the CSV datasets and the recorded episode videos',
      ]}
      note="Planned for a later phase. This page will present the report as written and will not replace it with generic explanations."
    />
  )
}
