import type { City, Skill, User } from '@/shared/types'

export const REGISTRATIONS_KEY = 'skillswap_registrations'

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
    [user.teach, user.learn, user.likesCard, skill.images, value.learningCategoryIds].every(
      isStringArray,
    ) &&
    (user.likesSubcategoryIds === undefined || isStringArray(user.likesSubcategoryIds)) &&
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
