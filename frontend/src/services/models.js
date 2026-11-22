import { apiClient } from './apiClient.js'
import { parseModels } from './contracts.js'

// GET /api/models  (prepared for the backend; the app currently reads its static model data)
export async function listModels(client = apiClient, options) {
  return parseModels(await client.request('/api/models', options))
}
