import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import HomePage from '@/pages/HomePage'
import NotFoundPage from '@/pages/NotFoundPage'

// Admin code is split into lazy chunks so public visitors never download it.
const lazyPage = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

const adminPages = {
  profile: () => import('@/admin/pages/ProfilePage'),
  experience: () => import('@/admin/pages/ExperiencePage'),
  projects: () => import('@/admin/pages/ProjectsPage'),
  skills: () => import('@/admin/pages/SkillsPage'),
  education: () => import('@/admin/pages/EducationPage'),
  certifications: () => import('@/admin/pages/CertificationsPage'),
  achievements: () => import('@/admin/pages/AchievementsPage'),
  stats: () => import('@/admin/pages/StatsPage'),
  messages: () => import('@/admin/pages/MessagesPage'),
  resume: () => import('@/admin/pages/ResumePage'),
  'social-links': () => import('@/admin/pages/SocialLinksPage'),
  settings: () => import('@/admin/pages/SettingsPage'),
}

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
          ...Object.entries(adminPages).map(([path, load]) => ({ path, lazy: lazyPage(load) })),
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
