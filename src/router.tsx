import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { ADMIN_SECTIONS } from '@/admin/navigation'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

// Admin code is split into lazy chunks so public visitors never download it.
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

const sectionPlaceholder = lazyPage(() => import('@/admin/pages/SectionPlaceholderPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/admin',
    lazy: lazyPage(() => import('@/admin/AdminRoot')),
    children: [
      {
        path: 'login',
        lazy: lazyPage(() => import('@/admin/pages/LoginPage')),
      },
      {
        lazy: lazyPage(() => import('@/admin/layout/AdminLayout')),
        children: [
          {
            index: true,
            lazy: lazyPage(() => import('@/admin/pages/DashboardPage')),
          },
          ...ADMIN_SECTIONS.filter((section) => section.path !== '').map((section) => ({
            path: section.path,
            lazy: sectionPlaceholder,
          })),
          { path: '*', Component: NotFoundPage },
        ],
      },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
])
