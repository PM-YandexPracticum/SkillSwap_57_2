import type { City, Skill, User } from '@/shared/types'
import { LOCAL_STORAGE_KEYS } from './constants'
import { MOCK_USERS_KEY, updateMockUser } from '@/features/auth/model/authUtils'

export const REGISTRATIONS_KEY = 'skillswap_registrations'
export const PROFILE_CHANGES_KEY = 'skillswap_profile_changes'

export interface RegistrationRecord {
  user: User
  skill: Skill
  city: City | null
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

function isRecord(value: unknown): value is RegistrationRecord {
  if (!isObject(value) || !isObject(value.user) || !isObject(value.skill)) return false
  const { user, skill } = value
  return (
    ['id', 'name', 'email', 'aboutMe', 'city', 'birthDate', 'createdAt'].every(
      (key) => typeof user[key] === 'string',
    ) &&
    ['id', 'title', 'category', 'subcategory', 'description'].every(
      (key) => typeof skill[key] === 'string',
    ) &&
    (user.avatar === null || typeof user.avatar === 'string') &&
    ['unspecified', 'male', 'female'].includes(String(user.gender)) &&
    typeof user.likesCount === 'number' &&
    [user.teach, user.learn, user.likesCard, skill.images].every(isStringArray) &&
    (user.learningSubcategoryIds === undefined || isStringArray(user.learningSubcategoryIds)) &&
    isStringArray(user.teach) &&
    typeof skill.id === 'string' &&
    user.teach.includes(skill.id) &&
    (value.city === null ||
      (isObject(value.city) &&
        typeof value.city.id === 'string' &&
        typeof value.city.title === 'string'))
  )
}

/** Только сериализованные данные: File и пароль в это хранилище не попадают. */
export function readRegistrations(): RegistrationRecord[] {
  const raw = localStorage.getItem(REGISTRATIONS_KEY)
  if (!raw) return []
  const records: unknown = JSON.parse(raw)
  if (!Array.isArray(records) || !records.every(isRecord)) {
    throw new Error('Повреждены сохранённые данные регистрации')
  }
  return records
}

/** Ошибка локального хранилища не должна мешать загрузке исходных JSON-моков. */
export function getRegisteredItems() {
  try {
    const records = readRegistrations()
    return {
      users: records.map((record) => record.user),
      skills: records.map((record) => record.skill),
    }
  } catch {
    return { users: [], skills: [] }
  }
}

export function mergeById<T extends { id: string }>(base: T[], added: T[]): T[] {
  return [...new Map([...base, ...added].map((item) => [item.id, item])).values()]
}

/** Профили из JSON хранятся здесь отдельно от неизменяемых исходных моков. */
export function readProfileChanges(): User[] {
  const raw = localStorage.getItem(PROFILE_CHANGES_KEY)
  if (!raw) return []
  const users: unknown = JSON.parse(raw)
  if (!Array.isArray(users) || !users.every((user) =>
    isObject(user) && typeof user.id === 'string' && typeof user.name === 'string',
  )) throw new Error('Повреждены сохранённые данные профиля')
  return users as User[]
}

export function getProfileChanges(): User[] {
  try {
    return readProfileChanges()
  } catch {
    return []
  }
}

/** Сохраняет профиль и учётные данные вместе; при ошибке восстанавливает прежние записи. */
export function saveProfileChanges(user: User, password?: string): void {
  const keys = [PROFILE_CHANGES_KEY, REGISTRATIONS_KEY, MOCK_USERS_KEY, LOCAL_STORAGE_KEYS.AUTH_USER]
  const previous = keys.map((key) => localStorage.getItem(key))
  const changes = readProfileChanges()
  const registrations = readRegistrations()
  try {
    updateMockUser({ id: user.id, name: user.name, email: user.email }, password)
    localStorage.setItem(PROFILE_CHANGES_KEY, JSON.stringify(mergeById(changes, [user])))
    const updated = registrations.map((record) => record.user.id === user.id
      ? { ...record, user }
      : record)
    if (updated.some((record, index) => record !== registrations[index])) {
      localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(updated))
    }
    const authRaw = previous[3]
    if (authRaw) {
      const auth = JSON.parse(authRaw) as { id: string; name: string; email: string; token: string }
      if (auth.id === user.id) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_USER, JSON.stringify({
          ...auth, name: user.name, email: user.email,
        }))
      }
    }
  } catch (error) {
    keys.forEach((key, index) => {
      try {
        if (previous[index] === null) localStorage.removeItem(key)
        else localStorage.setItem(key, previous[index]!)
      } catch { /* Хранилище может быть недоступно и для отката. */ }
    })
    throw error
  }
}
