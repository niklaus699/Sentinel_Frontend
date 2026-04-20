import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { OverviewPage } from '@/pages/OverviewPage'
import { AssetsPage } from '@/pages/AssetsPage'
import { FindingsPage } from '@/pages/FindingsPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { AssetDetailPage } from './pages/AssetDetailPage'
import { CVECatalogPage } from './pages/CVECatalogPage'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

// Optional: a simple fallback for the root boundary
const RootFallback = () => (
  <div className="flex h-screen items-center justify-center bg-red-50 text-red-800">
    <div className="text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2">Please refresh the page or contact support.</p>
    </div>
  </div>
)

export default function App() {
  return (
    <ErrorBoundary fallback={<RootFallback />}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Wrap protected routes with another boundary to keep layout alive */}
            <Route element={<DashboardLayout />}>
              <Route
                index
                element={
                  <ErrorBoundary>
                    <OverviewPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="assets"
                element={
                  <ErrorBoundary>
                    <AssetsPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="findings"
                element={
                  <ErrorBoundary>
                    <FindingsPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="assets/:id"
                element={
                  <ErrorBoundary>
                    <AssetDetailPage />
                  </ErrorBoundary>
                }
              />
              <Route
                path="cves"
                element={
                  <ErrorBoundary>
                    <CVECatalogPage />
                  </ErrorBoundary>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}