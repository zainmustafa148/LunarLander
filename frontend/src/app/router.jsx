import { createBrowserRouter } from 'react-router-dom'
import AppShell from '../components/layout/AppShell.jsx'
import RouteError from '../components/feedback/RouteError.jsx'
import { NAV_ITEMS } from './navigation.js'

// React Router lazy routes expect { Component }; our pages use default exports.
const lazyPage = (load) => async () => ({ Component: (await load()).default })

const pageRoutes = NAV_ITEMS.map((item) =>
  item.path === '/'
    ? { index: true, lazy: lazyPage(item.load) }
    : { path: item.path.slice(1), lazy: lazyPage(item.load) },
)

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      {
        // Pathless route: errors render inside the shell, so navigation keeps working.
        errorElement: <RouteError />,
        children: [
          ...pageRoutes,
          { path: '*', lazy: lazyPage(() => import('../pages/NotFoundPage.jsx')) },
        ],
      },
    ],
  },
])
