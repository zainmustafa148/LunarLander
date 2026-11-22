import { apiClient } from './apiClient.js'

// GET /api/results/summary and GET /api/results/episodes?model=...
// Prepared for the backend. The Results page reads the verified static files in public/data, so
// nothing calls these yet; they return the backend's JSON unchanged for later use.
export const getResultsSummary = (client = apiClient, options) => client.request('/api/results/summary', options)

export const getEpisodeResults = (modelId, client = apiClient, options) =>
  client.request(`/api/results/episodes?model=${encodeURIComponent(modelId)}`, options)
