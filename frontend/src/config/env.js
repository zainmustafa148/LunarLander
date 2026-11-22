// Build-time configuration. Set VITE_API_BASE_URL (for example in .env.local) to point the app at
// the future Flask backend, e.g. VITE_API_BASE_URL=http://localhost:5000. When it is empty the app
// runs entirely on the static research data and makes no backend requests.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '')
export const BACKEND_CONFIGURED = API_BASE_URL !== ''
