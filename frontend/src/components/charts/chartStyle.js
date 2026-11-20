// Shared chart constants. Model colours come from useChartTheme(); these keys pick them.
export const MODEL_COLOR_KEYS = {
  baseline: 'modelBaseline',
  badReward: 'modelBadReward',
  improved: 'modelImproved',
}

// The bad-reward and improved colours are close (purple and indigo), so line charts also
// separate the models by dash pattern. Baseline is solid.
export const MODEL_DASH = {
  baseline: undefined,
  badReward: '8 4',
  improved: '2 3',
}

export const AXIS_FONT_SIZE = 12
