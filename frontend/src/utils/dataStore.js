import { DATASETS } from '../data/datasets.js'

/*
 * Loads the generated JSON files from public/data/ on demand and caches them.
 * It is an external store (read with useSyncExternalStore in hooks/useDatasets.js), so components
 * never call setState from an effect.
 *
 * Entry status:
 *   idle        not requested yet (shown as loading)
 *   loading     request in flight
 *   ready       { table }  validated data
 *   unavailable the file is missing, is not the expected JSON, or lacks required columns
 *   error       the request failed (network or server error); a retry may help
 */
const IDLE = Object.freeze({ status: 'idle' })

export function createDataStore({ baseUrl, fetchImpl = (...args) => fetch(...args) }) {
  const entries = new Map()
  const combined = new Map()
  const listeners = new Set()
  let version = 0

  function setEntry(id, entry) {
    entries.set(id, Object.freeze({ ...entry, file: DATASETS[id]?.file }))
    version += 1
    listeners.forEach((listener) => listener())
  }

  function subscribe(listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  // Same object identity until something changes, as useSyncExternalStore requires.
  function getCombined(ids) {
    const key = ids.join('|')
    const cached = combined.get(key)
    if (cached && cached.version === version) return cached.value
    const value = Object.fromEntries(ids.map((id) => [id, entries.get(id) ?? IDLE]))
    combined.set(key, { version, value })
    return value
  }

  function validate(meta, json) {
    const { columns, rows } = json ?? {}
    if (!Array.isArray(columns) || !Array.isArray(rows)) {
      return { status: 'unavailable', reason: 'The file does not contain the expected "columns" and "rows".' }
    }
    if (typeof json.rowCount === 'number' && json.rowCount !== rows.length) {
      return { status: 'unavailable', reason: `The file says it has ${json.rowCount} rows but contains ${rows.length}.` }
    }
    if (rows.some((row) => !Array.isArray(row) || row.length !== columns.length)) {
      return { status: 'unavailable', reason: 'At least one row does not match the number of columns.' }
    }
    const missing = meta.required.filter((column) => !columns.includes(column))
    if (missing.length) {
      return { status: 'unavailable', reason: `Missing required column(s): ${missing.join(', ')}.` }
    }
    const index = Object.fromEntries(columns.map((column, position) => [column, position]))
    return { status: 'ready', table: { columns, rows, index, rowCount: rows.length, source: json.source ?? meta.source } }
  }

  async function fetchTable(meta) {
    let response
    try {
      response = await fetchImpl(`${baseUrl()}data/${meta.file}`)
    } catch {
      return { status: 'error', reason: 'The request failed. Check your connection and try again.' }
    }
    if (response.status === 404) {
      return { status: 'unavailable', reason: 'The file was not found in public/data.' }
    }
    if (!response.ok) {
      return { status: 'error', reason: `The server answered with HTTP ${response.status}.` }
    }
    let json
    try {
      json = await response.json()
    } catch {
      // The Vite dev server answers a missing public file with index.html, which is not JSON.
      return { status: 'unavailable', reason: 'The file is missing or is not valid JSON.' }
    }
    return validate(meta, json)
  }

  function load(id, force = false) {
    const meta = DATASETS[id]
    if (!meta) {
      setEntry(id, { status: 'error', reason: `"${id}" is not a known dataset.` })
      return
    }
    if (entries.has(id) && !force) return
    setEntry(id, { status: 'loading' })
    fetchTable(meta).then((result) => setEntry(id, result))
  }

  return {
    subscribe,
    getCombined,
    load,
    reload: (ids) => ids.forEach((id) => load(id, true)),
  }
}

// Collapses several dataset entries into one status for a chart.
//   loading      at least one dataset is still being requested
//   ready        every dataset is ready
//   partial      some are ready, some are not (the chart can draw what it has)
//   unavailable  none are ready and none failed with a request error
//   error        none are ready and at least one request failed
export function summarize(entries, ids) {
  const ready = []
  const pending = []
  const problems = []
  ids.forEach((id) => {
    const entry = entries[id]
    if (entry.status === 'ready') ready.push(id)
    else if (entry.status === 'idle' || entry.status === 'loading') pending.push(id)
    else problems.push({ id, file: entry.file, status: entry.status, reason: entry.reason })
  })
  let status = 'ready'
  if (pending.length) status = 'loading'
  else if (!ready.length) status = problems.some((p) => p.status === 'error') ? 'error' : 'unavailable'
  else if (problems.length) status = 'partial'
  return { status, ready, pending, problems }
}

// The app's shared store.
export const dataStore = createDataStore({ baseUrl: () => import.meta.env.BASE_URL })
