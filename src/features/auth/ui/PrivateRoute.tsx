import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/shared/lib/constants'
import { useRequireAuth } from '../model/useRequireAuth'

export function PrivateRoute() {
  const { isAuthenticated } = useRequireAuth()
  const location = useLocation()

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  )
}
