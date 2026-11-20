# LunarLander AI Lab: Frontend

React + Vite frontend for the LunarLander PPO / reward-shaping project.

## Commands

```bash
npm install
npm run dev      # development server
npm run lint
npm run build
npm run preview
```

## Principles

- Real data only: nothing is invented. Missing data gets an "Awaiting backend" state.
- Styling: CSS Modules + CSS variables (`src/styles/tokens.css`, `themes.css`).
- Themes: `data-theme` on `<html>`, saved in `localStorage`, defaulting to the OS preference.
- Everything lives inside `frontend/`.

Status: Phase 4 (Overview page) complete. Research & Docs is still a planned page.
