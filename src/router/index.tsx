import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthGuard from '@/router/AuthGuard'
import GuestGuard from '@/router/GuestGuard'

// Lazy-loaded layouts
const AppLayout = lazy(() => import('@/components/layout/AppLayout'))

// Public landing page
const LandingPage = lazy(() => import('@/pages/LandingPage'))
// Lazy-loaded auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
// Lazy-loaded app pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ProjectsPage = lazy(() => import('@/pages/projects/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('@/pages/projects/ProjectDetailPage'))
const ProjectKeysPage = lazy(() => import('@/pages/projects/ProjectKeysPage'))
const NewKeyPage = lazy(() => import('@/pages/projects/NewKeyPage'))
const ExportPage = lazy(() => import('@/pages/projects/ExportPage'))
const ImportPage = lazy(() => import('@/pages/projects/ImportPage'))
const TranslationsPage = lazy(() => import('@/pages/TranslationsPage'))
const ApprovalsPage = lazy(() => import('@/pages/ApprovalsPage'))
const ActivityPage = lazy(() => import('@/pages/ActivityPage'))
const ReviewPage = lazy(() => import('@/pages/ReviewPage'))
const TeamsPage = lazy(() => import('@/pages/TeamsPage'))
const TeamDetailPage = lazy(() => import('@/pages/TeamDetailPage'))
const VersionsPage = lazy(() => import('@/pages/VersionsPage'))
const EnvironmentsPage = lazy(() => import('@/pages/EnvironmentsPage'))
const IntegrationsPage = lazy(() => import('@/pages/IntegrationsPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const ApiKeysPage = lazy(() => import('@/pages/settings/ApiKeysPage'))
const ProfilePage = lazy(() => import('@/pages/settings/ProfilePage'))
const SetupPage = lazy(() => import('@/pages/SetupPage'))
const SdkDocsPage = lazy(() => import('@/pages/docs/SdkDocsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  // Public landing page
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <LandingPage />
      </SuspenseWrapper>
    ),
  },

  // Guest routes (redirect to /projects if already logged in)
  {
    element: <GuestGuard />,
    children: [
      {
        path: '/login',
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Authenticated routes with AppLayout
  {
    element: <AuthGuard />,
    children: [
      {
        element: (
          <SuspenseWrapper>
            <AppLayout />
          </SuspenseWrapper>
        ),
        children: [
          {
            path: '/dashboard',
            element: (
              <SuspenseWrapper>
                <DashboardPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/projects',
            element: (
              <SuspenseWrapper>
                <ProjectsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/projects/:slug',
            element: (
              <SuspenseWrapper>
                <ProjectDetailPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/projects/:slug/keys',
            element: (
              <SuspenseWrapper>
                <ProjectKeysPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/projects/:slug/keys/new',
            element: (
              <SuspenseWrapper>
                <NewKeyPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/projects/:slug/export',
            element: (
              <SuspenseWrapper>
                <ExportPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/projects/:slug/import',
            element: (
              <SuspenseWrapper>
                <ImportPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/translations',
            element: (
              <SuspenseWrapper>
                <TranslationsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/approvals',
            element: (
              <SuspenseWrapper>
                <ApprovalsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/activity',
            element: (
              <SuspenseWrapper>
                <ActivityPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/review',
            element: (
              <SuspenseWrapper>
                <ReviewPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/teams',
            element: (
              <SuspenseWrapper>
                <TeamsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/teams/:id',
            element: (
              <SuspenseWrapper>
                <TeamDetailPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/versions',
            element: (
              <SuspenseWrapper>
                <VersionsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/environments',
            element: (
              <SuspenseWrapper>
                <EnvironmentsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/integrations',
            element: (
              <SuspenseWrapper>
                <IntegrationsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/settings',
            element: (
              <SuspenseWrapper>
                <SettingsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/settings/api-keys',
            element: (
              <SuspenseWrapper>
                <ApiKeysPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/settings/profile',
            element: (
              <SuspenseWrapper>
                <ProfilePage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/docs/:sdk',
            element: (
              <SuspenseWrapper>
                <SdkDocsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },

      // Setup page - AuthGuard but NO AppLayout
      {
        path: '/setup',
        element: (
          <SuspenseWrapper>
            <SetupPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Catch-all: branded 404 for any unmatched URL
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
])
