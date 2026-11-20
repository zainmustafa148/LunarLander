import { useEffect, useSyncExternalStore } from 'react'
import { dataStore } from '../utils/dataStore.js'

// Returns { [datasetId]: entry } and starts loading anything not requested yet.
// `ids` must be a stable array (a module-level constant): it keys the store's snapshot cache.
export function useDatasets(ids) {
  const getSnapshot = () => dataStore.getCombined(ids)
  const entries = useSyncExternalStore(dataStore.subscribe, getSnapshot, getSnapshot)
  useEffect(() => {
    ids.forEach((id) => dataStore.load(id))
  }, [ids])
  return entries
}

export function reloadDatasets(ids) {
  dataStore.reload(ids)
}
