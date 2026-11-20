import {
  Activity,
  BookOpen,
  Cpu,
  LayoutDashboard,
  Play,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react'

// Single source of truth for navigation and routes.
// `load` returns the lazily imported page module (code splitting per route).
export const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, load: () => import('../pages/OverviewPage.jsx') },
  { path: '/models', label: 'Model Explorer', icon: Cpu, load: () => import('../pages/ModelExplorerPage.jsx') },
  { path: '/simulation', label: 'Live Simulation', icon: Play, load: () => import('../pages/LiveSimulationPage.jsx') },
  { path: '/reward-hacking', label: 'Reward Hacking', icon: ShieldAlert, load: () => import('../pages/RewardHackingPage.jsx') },
  { path: '/reward-shaping', label: 'Reward Shaping', icon: SlidersHorizontal, load: () => import('../pages/RewardShapingPage.jsx') },
  { path: '/results', label: 'Results & Analytics', icon: Activity, load: () => import('../pages/ResultsPage.jsx') },
  { path: '/docs', label: 'Research & Docs', icon: BookOpen, load: () => import('../pages/ResearchDocsPage.jsx') },
]

export const APP_NAME = 'LunarLander AI Lab'

export function getPageTitle(pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return NAV_ITEMS.find((item) => item.path === normalized)?.label ?? 'Page not found'
}
