import type { AuthUser } from '@/shared/types'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { generateId } from '@/shared/lib/helpers'

/** Ключ, под которым хранится список зарегистрированных (мок) пользователей. */
export const MOCK_USERS_KEY = 'skillswap_mock_users'

/** Тестовый JWT-токен (заглушка вместо реального). */
export const MOCK_TOKEN = 'token123'

/** Запись пользователя в мок-хранилище (пароль хранится только локально). */
export interface MockUserRecord {
  id: string
  name: string
  email: string
  password: string
}

/** Данные пользователя без токена. */
export type AuthUserData = Omit<AuthUser, 'token'>

/** Демо-пользователь, доступный сразу после первого запуска. */
const DEMO_USER: MockUserRecord = {
  id: 'demo-user',
  name: 'Демо Пользователь',
  email: 'demo@skillswap.ru',
  password: 'skillswap',
}

/** Читает текущего авторизованного пользователя из localStorage */
export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

/** Сохраняет пользователя и mock-токен в localStorage */
export function saveAuthUser(user: AuthUserData): AuthUser {
  const authUser: AuthUser = { ...user, token: MOCK_TOKEN }
  localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_USER, JSON.stringify(authUser))
  return authUser
}

/** Удаляет пользователя из localStorage (logout) */
export function clearAuthUser(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_USER)
}

/** Перезаписывает список мок-пользователей */
function writeMockUsers(users: MockUserRecord[]): void {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

/**
 * Читает список мок-пользователей из localStorage.
 * Если хранилище пустое — добавляет демо-пользователя, чтобы вход можно было проверить.
 */
function readMockUsers(): MockUserRecord[] {
  let users: MockUserRecord[] = []

  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY)
    users = raw ? (JSON.parse(raw) as MockUserRecord[]) : []
  } catch {
    users = []
  }

  if (users.length === 0) {
    users = [DEMO_USER]
    writeMockUsers(users)
  }

  return users
}

/** Обновляет учётные данные, сохраняя прежний пароль, если новый не задан. */
export function updateMockUser(user: AuthUserData, password?: string): void {
  const users = readMockUsers()
  const email = user.email.trim().toLowerCase()
  if (users.some((item) => item.id !== user.id && item.email.toLowerCase() === email)) {
    throw new Error('Пользователь с таким email уже зарегистрирован')
  }
  const existing = users.find((item) => item.id === user.id)
  if (!existing && !password) return
  writeMockUsers(existing
    ? users.map((item) => item.id === user.id
      ? { ...item, name: user.name, email, password: password || item.password }
      : item)
    : [...users, { id: user.id, name: user.name, email, password: password! }])
}

/** Ищет пользователя по email и паролю. Возвращает данные без пароля. */
export function findMockUser(email: string, password: string): AuthUserData | null {
  const normalizedEmail = email.trim().toLowerCase()

  const found = readMockUsers().find(
    (user) => user.email.toLowerCase() === normalizedEmail && user.password === password,
  )

  if (!found) return null

  return { id: found.id, name: found.name, email: found.email }
}

/** Регистрирует нового мок-пользователя. Возвращает null, если email уже занят. */
export function registerMockUser(data: {
  name: string
  email: string
  password: string
}): AuthUserData | null {
  const normalizedEmail = data.email.trim().toLowerCase()
  const users = readMockUsers()

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) return null

  const newUser: MockUserRecord = {
    id: generateId(),
    name: data.name.trim(),
    email: normalizedEmail,
    password: data.password,
  }

  writeMockUsers([...users, newUser])

  return { id: newUser.id, name: newUser.name, email: newUser.email }
}
