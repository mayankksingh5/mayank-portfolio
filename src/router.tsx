import { createBrowserRouter } from 'react-router'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    // Admin code is split into its own chunk so public visitors never download it.
    path: '/admin/*',
    lazy: async () => ({ Component: (await import('@/admin/AdminApp')).default }),
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
])
