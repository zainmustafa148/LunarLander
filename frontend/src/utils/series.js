// Small pure helpers for the research data tables. Nothing here changes or invents values.

export const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

// A table is { columns, rows, index } where rows are arrays in column order (see dataStore.js).
export function getColumn(table, name) {
  const position = table.index[name]
  if (position === undefined) return []
  return table.rows.map((row) => row[position])
}

// Trailing moving average over `windowSize` consecutive rows. A value is produced only once a full
// window exists, and only when every value in the window is a number; otherwise it is null.
export function movingAverage(values, windowSize) {
  const result = new Array(values.length).fill(null)
  for (let end = windowSize - 1; end < values.length; end += 1) {
    let sum = 0
    let complete = true
    for (let i = end - windowSize + 1; i <= end; i += 1) {
      if (!isNumber(values[i])) {
        complete = false
        break
      }
      sum += values[i]
    }
    if (complete) result[end] = sum / windowSize
  }
  return result
}

// Outcome categories shown in the UI. The source label "TIMEOUT (hovering)" is reported as a
// timeout; the app does not assert any behaviour beyond the episode reaching its step limit.
export function classifyOutcome(raw) {
  const text = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  if (text.startsWith('LANDED')) return { key: 'landed', label: 'Landed' }
  if (text.startsWith('CRASH')) return { key: 'crashed', label: 'Crashed' }
  if (text.startsWith('TIMEOUT')) return { key: 'timeout', label: 'Timeout' }
  return { key: 'unclassified', label: typeof raw === 'string' && raw !== '' ? raw : 'Not recorded' }
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const grouped = new Intl.NumberFormat('en')

export const formatSteps = (value) => compact.format(value)
export const formatCount = (value) => grouped.format(value)

// Index of the last element of an ascending array that is <= x, or -1 when there is none.
export function lastIndexAtOrBefore(sorted, x) {
  let low = 0
  let high = sorted.length - 1
  let found = -1
  while (low <= high) {
    const mid = (low + high) >> 1
    if (sorted[mid] <= x) {
      found = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return found
}
