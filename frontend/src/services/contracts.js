/*
 * Validators for the payloads the frontend expects from the backend (see docs/BACKEND_CONTRACT.md).
 * A payload that does not match is rejected, never repaired or filled in.
 */
const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

export const OBSERVATION_LENGTH = 8
export const ACTION_COUNT = 4

function fail(message) {
  throw new TypeError(message)
}

export function parseHealth(json) {
  if (json === null || typeof json !== 'object') fail('Health response must be a JSON object.')
  if (json.status !== undefined && json.status !== 'ok') fail(`Health status is "${json.status}", expected "ok".`)
  return { status: 'ok' }
}

export function parseModels(json) {
  const list = Array.isArray(json) ? json : json?.models
  if (!Array.isArray(list)) fail('Models response must be a list.')
  return list.map((model) => {
    if (typeof model?.id !== 'string' || typeof model?.name !== 'string') fail('Every model needs a string "id" and "name".')
    return { id: model.id, name: model.name, available: model.available !== false }
  })
}

export function parseSimulationCreated(json) {
  if (typeof json?.simulationId !== 'string' || json.simulationId === '') fail('The response needs a "simulationId" string.')
  return { simulationId: json.simulationId }
}

// Server-sent event "frame": { "image": "data:image/jpeg;base64,..." }
export function parseFrameEvent(json) {
  if (typeof json?.image !== 'string' || !json.image.startsWith('data:image/')) fail('A frame event needs an "image" data URL.')
  return { image: json.image }
}

// Server-sent event "state": one environment step. `reward` and `episodeReturn` are ORIGINAL
// environment rewards; the backend must not send custom or shaped rewards here.
export function parseStateEvent(json) {
  const { step, observation, action, reward, episodeReturn, terminated, truncated } = json ?? {}
  if (!Number.isInteger(step) || step < 0) fail('"step" must be a non-negative integer.')
  if (!Array.isArray(observation) || observation.length !== OBSERVATION_LENGTH || !observation.every(isNumber)) {
    fail(`"observation" must be ${OBSERVATION_LENGTH} numbers.`)
  }
  if (action !== null && !(Number.isInteger(action) && action >= 0 && action < ACTION_COUNT)) fail('"action" must be null or an integer from 0 to 3.')
  if (!isNumber(reward) || !isNumber(episodeReturn)) fail('"reward" and "episodeReturn" must be numbers.')
  if (typeof terminated !== 'boolean' || typeof truncated !== 'boolean') fail('"terminated" and "truncated" must be booleans.')
  return { step, observation, action, reward, episodeReturn, terminated, truncated }
}
