// Phase 3: no backend integration exists yet, so the honest status is "not-connected".
// Phase 7 replaces this with a real request to GET /api/health. Nothing is simulated here.
export function useBackendHealth() {
  return { status: 'not-connected' }
}
