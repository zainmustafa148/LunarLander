import { API_BASE_URL } from '../config/env.js'

/*
 * Thin JSON client for the future Flask backend. It never returns made-up data: every failure is
 * thrown as an ApiError so the caller can show an honest unavailable or error state.
 *
 *   kind 'not-configured'  VITE_API_BASE_URL is empty, so no request was made
 *   kind 'network'         the request could not be completed (server down, CORS, offline)
 *   kind 'timeout'         no answer within timeoutMs
 *   kind 'http'            the server answered with a non-2xx status (see `status`)
 *   kind 'invalid'         the answer was not valid JSON
 */
export class ApiError extends Error {
  constructor(kind, message, status) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

export function createApiClient({ baseUrl, fetchImpl = (...args) => fetch(...args), timeoutMs = 8000 } = {}) {
  async function request(path, { method = 'GET', body, signal } = {}) {
    if (!baseUrl) throw new ApiError('not-configured', 'No backend is configured (VITE_API_BASE_URL is empty).')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort('timeout'), timeoutMs)
    signal?.addEventListener('abort', () => controller.abort(signal.reason), { once: true })

    let response
    try {
      response = await fetchImpl(`${baseUrl}${path}`, {
        method,
        headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (error) {
      if (controller.signal.aborted && controller.signal.reason === 'timeout') {
        throw new ApiError('timeout', `The backend did not answer within ${timeoutMs / 1000} seconds.`)
      }
      if (controller.signal.aborted) throw error
      throw new ApiError('network', 'The backend could not be reached.')
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) throw new ApiError('http', `The backend answered with HTTP ${response.status}.`, response.status)
    if (response.status === 204) return null
    try {
      return await response.json()
    } catch {
      throw new ApiError('invalid', 'The backend answer was not valid JSON.', response.status)
    }
  }

  return { baseUrl, request }
}

export const apiClient = createApiClient({ baseUrl: API_BASE_URL })
