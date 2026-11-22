import { apiClient } from './apiClient.js'
import { parseHealth } from './contracts.js'

// GET /api/health
export async function getHealth(client = apiClient, options) {
  return parseHealth(await client.request('/api/health', options))
}
