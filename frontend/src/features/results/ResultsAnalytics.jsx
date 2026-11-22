import { useState } from 'react'
import { DATASETS } from '../../data/datasets.js'
import { MODEL_IDS, MODELS } from '../../data/models.js'
import { EVALUATION, PROTOCOL } from '../../data/results.js'
import { useDatasets } from '../../hooks/useDatasets.js'
import { formatNumber } from '../../utils/format.js'
import { formatCount } from '../../utils/series.js'
import { EpisodeLengthChart, EpisodeRewardChart } from '../../components/charts/EpisodeCharts.jsx'
import { ObjectiveCurveChart, TrainingCurveChart } from '../../components/charts/TrainingCurveChart.jsx'
import Section from '../../components/layout/Section.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Callout from '../../components/ui/Callout.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import MetricCard from '../../components/ui/MetricCard.jsx'
import Tabs, { TabPanel } from '../../components/ui/Tabs.jsx'
import styles from './ResultsAnalytics.module.css'

/*
 * Results & Analytics: the evaluation, training and data-check views, built on the Phase 5 charts.
 * Every chart reads the verified static datasets in public/data.
 */
const TABS = [
  { id: 'evaluation', label: 'Evaluation episodes' },
  { id: 'training', label: 'Training curves' },
  { id: 'objectives', label: 'Training objectives' },
  { id: 'data', label: 'Loaded data check' },
]

const CHECKED_DATASETS = ['evalPerEpisode', 'trainBaseline', 'trainBad', 'trainImproved']
const STATUS_BADGES = {
  ready: { tone: 'success', label: 'Loaded' },
  idle: { tone: 'neutral', label: 'Loading' },
  loading: { tone: 'neutral', label: 'Loading' },
  unavailable: { tone: 'warning', label: 'Unavailable' },
  error: { tone: 'danger', label: 'Error' },
}

// Row and column counts as the browser loaded them, to compare with the conversion script's output.
function LoadedDataCheck() {
  const entries = useDatasets(CHECKED_DATASETS)
  const rows = CHECKED_DATASETS.map((id) => {
    const entry = entries[id]
    const badge = STATUS_BADGES[entry.status]
    return {
      id,
      label: <code>{DATASETS[id].file}</code>,
      cells: {
        status: (
          <>
            <Badge tone={badge.tone}>{badge.label}</Badge>
            {entry.reason && <span className={styles.reason}> {entry.reason}</span>}
          </>
        ),
        rows: entry.status === 'ready' ? formatCount(entry.table.rowCount) : '—',
        columns: entry.status === 'ready' ? entry.table.columns.length : '—',
      },
    }
  })
  return (
    <Section
      id="res-data-check"
      title="Loaded data check"
      description="Row and column counts of the files this page loaded. They should equal the counts printed by scripts/csv-to-json.mjs and the number of CSV data rows."
    >
      <DataTable
        caption="Loaded data files with row and column counts"
        labelHeader="File in public/data"
        columns={[
          { id: 'status', header: 'Status' },
          { id: 'rows', header: 'Data rows' },
          { id: 'columns', header: 'Columns' },
        ]}
        rows={rows}
      />
    </Section>
  )
}

export default function ResultsAnalytics() {
  const [tab, setTab] = useState('evaluation')
  return (
    <div className={styles.preview}>
      <Callout title="How to read these results">
        Models are compared on the original environment reward only, with the original landing rule. Each model was evaluated over ten episodes after a single training run, so differences are observations, not statistically established. Custom and shaped rewards appear only under Training objectives, on separate charts.
      </Callout>

      <div>
        <Tabs label="Results views" idPrefix="results" tabs={TABS} value={tab} onChange={setTab} />

        <TabPanel idPrefix="results" id="evaluation" value={tab}>
          <div className={styles.stack}>
            <Section
              id="res-summary"
              title="Evaluation summary"
              description="Original environment reward only, from the verified evaluation results."
            >
              <div className={styles.metrics}>
                {MODEL_IDS.map((id) => (
                  <MetricCard
                    key={id}
                    label={MODELS[id].name}
                    accentVar={MODELS[id].colorVar}
                    value={formatNumber(EVALUATION[id].meanReward)}
                    unit="mean original reward"
                    caption={`Standard deviation ${formatNumber(EVALUATION[id].std)}. Landed in ${EVALUATION[id].landed} of ${PROTOCOL.episodes} episodes.`}
                  />
                ))}
              </div>
            </Section>
            <Section
              id="res-episodes"
              title="Per-episode results"
              description="Every evaluation episode, loaded from the converted per-episode file."
            >
              <div className={styles.charts}>
                <EpisodeRewardChart />
                <EpisodeLengthChart />
              </div>
            </Section>
          </div>
        </TabPanel>

        <TabPanel idPrefix="results" id="training" value={tab}>
          <Section
            id="res-training"
            title="Training curves"
            description="Original environment reward during training, for all three models."
          >
            <TrainingCurveChart />
          </Section>
        </TabPanel>

        <TabPanel idPrefix="results" id="objectives" value={tab}>
          <div className={styles.stack}>
            <Callout tone="warning" title="Different scales, not comparable">
              Each chart below shows one model&apos;s reward under its own training objective. The scales differ, so the charts are
              drawn separately and must not be compared with each other or with original reward.
            </Callout>
            <div className={styles.charts}>
              <ObjectiveCurveChart seriesId="badCustom" />
              <ObjectiveCurveChart seriesId="improvedShaped" />
              <ObjectiveCurveChart seriesId="improvedShaping" />
            </div>
          </div>
        </TabPanel>

        <TabPanel idPrefix="results" id="data" value={tab}>
          <LoadedDataCheck />
        </TabPanel>
      </div>
    </div>
  )
}
