import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './hooks/useAuth.tsx'
import { ThemeProvider } from './components/ThemeProvider.tsx'
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards.tsx'
import Landing from './pages/Landing.tsx'
import Login from './pages/Login.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Analytics from './pages/Analytics.tsx'
import Settings from './pages/Settings.tsx'
import LinkDetail from './pages/LinkDetail.tsx'
import NotFound from './pages/NotFound.tsx'
import RedirectHandler from './components/RedirectHandler.tsx'
import './styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />

              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<Login />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/links" element={<Dashboard />} />
                <Route path="/dashboard/links/:slug" element={<LinkDetail />} />
                <Route path="/dashboard/analytics" element={<Analytics />} />
                <Route path="/dashboard/settings" element={<Settings />} />
              </Route>

              <Route path="/:slug" element={<RedirectHandler />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
