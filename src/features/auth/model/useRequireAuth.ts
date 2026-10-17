import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ROUTES } from '@/shared/lib/constants'
import { selectIsAuthenticated } from './authSelectors'

/** Общая проверка для маршрута и действий, требующих учебной авторизации. */
export function useRequireAuth() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()

  const requireAuth = () => {
    if (isAuthenticated) return true
    navigate(ROUTES.LOGIN, { state: { from: location } })
    return false
  }

  return { isAuthenticated, requireAuth }
}
