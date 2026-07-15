import { createBrowserRouter, Navigate } from 'react-router-dom'
import { HydrateFallback } from '@/components/common/HydrateFallback'

export const router = createBrowserRouter([
  {
    path: '/login',
    HydrateFallback,
    lazy: () => import('@/pages/auth/LoginPage').then(m => ({ Component: m.default })),
  },
  {
    path: '/',
    HydrateFallback,
    lazy: () => import('@/components/layout/AdminLayout').then(m => ({ Component: m.default })),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        lazy: () => import('@/pages/dashboard/DashboardPage').then(m => ({ Component: m.default })),
      },
      // Content
      {
        path: 'content/subjects',
        lazy: () => import('@/pages/content/subjects/SubjectsPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/journals',
        lazy: () => import('@/pages/content/journals/JournalsPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/issues',
        lazy: () => import('@/pages/content/issues/IssuesPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/papers',
        lazy: () => import('@/pages/content/papers/PapersPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/blog',
        lazy: () => import('@/pages/content/blog/BlogPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/services',
        lazy: () => import('@/pages/content/services/ServicesPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/static-pages',
        lazy: () => import('@/pages/content/static-pages/StaticPagesPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/announcements',
        lazy: () => import('@/pages/content/announcements/AnnouncementsPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/call-for-papers',
        lazy: () => import('@/pages/content/call-for-papers/CallForPapersPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/packages',
        lazy: () => import('@/pages/content/packages/PackagesPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'content/partners',
        lazy: () => import('@/pages/content/partners/PartnersPage').then(m => ({ Component: m.default })),
      },
      // Editorial
      {
        path: 'editorial/submissions',
        lazy: () => import('@/pages/editorial/submissions/SubmissionsPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'editorial/reviewers',
        lazy: () => import('@/pages/editorial/reviewers/ReviewersPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'editorial/assignments',
        lazy: () => import('@/pages/editorial/assignments/AssignmentsPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'editorial/decisions',
        lazy: () => import('@/pages/editorial/decisions/DecisionsPage').then(m => ({ Component: m.default })),
      },
      // Other sections
      {
        path: 'payments',
        lazy: () => import('@/pages/payments/PaymentsPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'certificates',
        lazy: () => import('@/pages/certificates/CertificatesPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'users',
        lazy: () => import('@/pages/users/UsersPage').then(m => ({ Component: m.default })),
      },
      {
        path: 'settings',
        lazy: () => import('@/pages/settings/SettingsPage').then(m => ({ Component: m.default })),
      },
    ],
  },
  {
    path: '/',
    HydrateFallback,
    lazy: () => import('@/components/layout/AdminLayout').then(m => ({ Component: m.default })),
    children: [
      {
        path: '*',
        lazy: () => import('@/pages/errors/NotFoundPage').then(m => ({ Component: m.default })),
      },
    ],
  },
])
