# Backend contract (frontend side)

The frontend works on its own using the verified static datasets in `public/data/`. This document
describes the endpoints the future Flask / Gymnasium / Stable-Baselines3 backend should provide so the
prepared service layer in `src/services/` can use them. **No backend exists yet, and nothing in the
frontend simulates one.**

Set `VITE_API_BASE_URL` (see `.env.example`) to enable requests. When it is empty no request is made and
the topbar shows "Backend not connected". The Flask server must allow the site's origin (CORS), or the
Vite dev server can proxy `/api`.

All bodies are JSON. Errors are any non-2xx status; the frontend shows an unavailable state and never
fills in data it did not receive.

| Method and path | Purpose | Request | Response |
| --- | --- | --- | --- |
| `GET /api/health` | Liveness, polled every 30 s | none | `{ "status": "ok" }` |
| `GET /api/models` | Models the server can load | none | `[{ "id", "name", "available" }]` (or `{ "models": [...] }`) |
| `GET /api/results/summary` | Evaluation summary | none | backend's own JSON (not used by the UI yet) |
| `GET /api/results/episodes?model=<id>` | Per-episode evaluation | none | backend's own JSON (not used by the UI yet) |
| `POST /api/simulations` | Start a run | `{ "modelId", "seed", "deterministic" }` | `{ "simulationId" }` |
| `POST /api/simulations/{id}/reset` | Restart the same model and seed | none | any 2xx |
| `DELETE /api/simulations/{id}` | Stop and free the run | none | any 2xx |
| `GET /api/simulations/{id}/events` | Server-Sent Events stream | none | events below |

Model ids used by the frontend: `baseline`, `badReward`, `improved` (files `lunar_lander_ppo.zip`,
`lunar_lander_bad_reward.zip`, `lunar_lander_improved_reward.zip`).

## Simulation events

```
event: frame
data: {"image": "data:image/jpeg;base64,..."}

event: state
data: {"step": 0, "observation": [8 numbers], "action": null, "reward": 0.0,
       "episodeReturn": 0.0, "terminated": false, "truncated": false}

event: end
data: {}
```

* `observation` has the 8 LunarLander-v3 values in the report's order: x, y, horizontal velocity,
  vertical velocity, angle, angular velocity, left leg contact, right leg contact.
* `action` is `null` before the first step, then 0 (nothing), 1 (left engine), 2 (main engine) or 3 (right engine).
* `reward` and `episodeReturn` are **original environment rewards**. Custom (Bad Reward) and shaped
  (Improved Reward) training rewards must never be sent in these fields.
* `terminated` and `truncated` follow Gymnasium. An episode that is truncated at 1,000 steps is shown as a
  timeout; the frontend asserts no behaviour beyond that.
* The frontend validates every event (`src/services/contracts.js`) and ignores invalid ones.
