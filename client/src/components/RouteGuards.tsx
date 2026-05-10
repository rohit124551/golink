import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.tsx'

export function ProtectedRoute() {
  const { session, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <span className="spinner" style={{ width: '24px', height: '24px' }} />
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
