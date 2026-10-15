import { useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ROUTES } from '@/shared/lib/constants'

/** Общая проверка для маршрута и действий, требующих учебной авторизации. */
export function useRequireAuth() {
  const token = useAppSelector((state) => state.auth.user?.token)
  const isAuthenticated = typeof token === 'string' && token.trim().length > 0
  const location = useLocation()
  const navigate = useNavigate()

  const requireAuth = () => {
    if (isAuthenticated) return true
    navigate(ROUTES.LOGIN, { state: { from: location } })
    return false
  }

  return { isAuthenticated, requireAuth }
}
