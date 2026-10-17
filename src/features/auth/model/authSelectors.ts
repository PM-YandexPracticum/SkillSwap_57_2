import type { AuthUser } from '@/shared/types'
import type { AuthState } from './authSlice'

// Минимальная форма стейта, чтобы селекторы не тянули RootState из store
// (иначе получился бы циклический импорт auth → store).
type StateWithAuth = { auth: AuthState }

/** Текущий авторизованный пользователь (или null для гостя). */
export const selectCurrentUser = (state: StateWithAuth): AuthUser | null => state.auth.user

/** Статус запроса авторизации/регистрации: 'idle' или 'loading'. */
export const selectAuthStatus = (state: StateWithAuth): AuthState['status'] => state.auth.status

/** Текст последней ошибки авторизации (или null). */
export const selectAuthError = (state: StateWithAuth): string | null => state.auth.error

/**
 * Определяет, авторизован ли пользователь.
 * Логика согласована с существующей проверкой токена: токен — непустая строка.
 */
export const selectIsAuthenticated = (state: StateWithAuth): boolean => {
  const token = state.auth.user?.token
  return typeof token === 'string' && token.trim().length > 0
}
