import { Link } from 'react-router-dom'
import Section from '../components/layout/Section.jsx'
import ExperimentsSection from '../features/overview/ExperimentsSection.jsx'
import FindingsSection from '../features/overview/FindingsSection.jsx'
import IntroSection from '../features/overview/IntroSection.jsx'
import ModelCards from '../features/overview/ModelCards.jsx'
import PerformanceSection from '../features/overview/PerformanceSection.jsx'
import { SOURCES } from '../data/sources.js'
import styles from './OverviewPage.module.css'

export default function OverviewPage() {
  return (
    <div className={styles.page}>
      <IntroSection />

      <Section
        id="models"
        title="The three trained models"
        description="Three PPO agents, trained with identical algorithm settings. Only the training reward differs."
      >
        <ModelCards />
      </Section>

      <Section
        id="performance"
        title="Model performance comparison"
        description="All three agents compared on the original environment reward and the original landing rule."
      >
        <PerformanceSection />
      </Section>

      <Section
        id="experiments"
        title="The three experiments"
        description="Baseline, reward hacking and potential-based reward shaping, in the order they were run."
      >
        <ExperimentsSection />
      </Section>

      <Section id="findings" title="Key research findings">
        <FindingsSection />
      </Section>

      <p className={styles.sources}>
        Sources: the {SOURCES.report} and the{' '}
        <a href={SOURCES.repoUrl} target="_blank" rel="noopener noreferrer">
          project repository
        </a>
        . The full report, graphs, datasets and recorded episodes are planned for{' '}
        <Link to="/docs">Research &amp; Docs</Link>.
      </p>
    </div>
  )
}
