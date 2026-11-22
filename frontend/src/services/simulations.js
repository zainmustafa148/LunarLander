import { API_BASE_URL } from '../config/env.js'
import { apiClient } from './apiClient.js'
import { parseFrameEvent, parseSimulationCreated, parseStateEvent } from './contracts.js'

// POST /api/simulations  { modelId, seed, deterministic }  ->  { simulationId }
export async function createSimulation({ modelId, seed, deterministic }, client = apiClient, options) {
  const json = await client.request('/api/simulations', { ...options, method: 'POST', body: { modelId, seed, deterministic } })
  return parseSimulationCreated(json)
}

// POST /api/simulations/:id/reset  restarts the same model and seed from step 0
export const resetSimulation = (simulationId, client = apiClient, options) =>
  client.request(`/api/simulations/${encodeURIComponent(simulationId)}/reset`, { ...options, method: 'POST' })

// DELETE /api/simulations/:id  stops the run and frees it on the server
export const stopSimulation = (simulationId, client = apiClient, options) =>
  client.request(`/api/simulations/${encodeURIComponent(simulationId)}`, { ...options, method: 'DELETE' })

/*
 * GET /api/simulations/:id/events  (Server-Sent Events)
 *   event: frame  data: { image }            a rendered frame
 *   event: state  data: { step, observation, action, reward, episodeReturn, terminated, truncated }
 *   event: end    data: {}                   the run finished or was stopped
 * Invalid payloads are reported through onError and otherwise ignored. Returns a function that
 * closes the stream.
 */
export function openSimulationStream(simulationId, { onFrame, onState, onEnd, onError }, { EventSourceImpl = globalThis.EventSource } = {}) {
  const source = new EventSourceImpl(`${API_BASE_URL}/api/simulations/${encodeURIComponent(simulationId)}/events`)

  const listen = (name, handle) =>
    source.addEventListener(name, (event) => {
      try {
        handle(JSON.parse(event.data))
      } catch (error) {
        onError(new Error(`Invalid "${name}" event: ${error.message}`))
      }
    })

  listen('frame', (json) => onFrame(parseFrameEvent(json)))
  listen('state', (json) => onState(parseStateEvent(json)))
  listen('end', () => {
    source.close()
    onEnd()
  })
  source.onerror = () => {
    source.close()
    onError(new Error('The connection to the simulation stream was lost.'))
  }
  return () => source.close()
}
