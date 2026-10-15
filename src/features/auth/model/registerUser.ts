import { createAsyncThunk } from '@reduxjs/toolkit'
import { format, isValid } from 'date-fns'
import type { AuthUser, City, Skill, User } from '@/shared/types'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import { generateId } from '@/shared/lib/helpers'
import {
  readRegistrations,
  REGISTRATIONS_KEY,
  type RegistrationRecord,
} from '@/shared/lib/registrationStorage'
import { MOCK_USERS_KEY, registerMockUser, saveAuthUser } from './authUtils'
import { addRegisteredUser } from '@/entities/user/model/usersSlice'
import { addRegisteredSkill } from '@/entities/skill/model/skillsSlice'

export interface RegistrationData {
  email: string
  password: string
  profile: {
    name: string
    avatar: File | null
    birthDate: Date | null
    gender: User['gender']
    city: City | null
    learningSkills: { categoryIds: string[]; skillIds: string[] }
    aboutMe?: string
  }
  offer: Omit<Skill, 'id' | 'images'> & { images: File[] }
}

function readImage(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) {
    return Promise.reject(new Error('Выберите изображение JPEG или PNG размером до 2 МБ'))
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не удалось прочитать изображение'))
    reader.onabort = () => reject(new Error('Чтение изображения отменено'))
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Не удалось прочитать изображение'))
    reader.readAsDataURL(file)
  })
}

/** Завершение после подтверждения предпросмотра. Все записи откатываются при ошибке. */
export const registerUser = createAsyncThunk<
  RegistrationRecord & { authUser: AuthUser },
  RegistrationData,
  { rejectValue: string }
>(
  'auth/registerUser',
  async ({ email, password, profile, offer }, { rejectWithValue, dispatch }) => {
    try {
      if (!profile.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password) {
        throw new Error('Проверьте имя, email и пароль')
      }
      if (
        ![offer.title, offer.category, offer.subcategory, offer.description].every((value) =>
          value.trim(),
        )
      ) {
        throw new Error('Заполните данные предложения')
      }
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (profile.birthDate && (!isValid(profile.birthDate) || profile.birthDate > today)) {
        throw new Error('Проверьте дату рождения')
      }
      // Сначала читаем файлы. Нельзя сохранять blob: URL — после перезагрузки они не работают.
      const [avatar, images] = await Promise.all([
        profile.avatar ? readImage(profile.avatar) : null,
        Promise.all(offer.images.map(readImage)),
      ])
      const records = readRegistrations()
      const keys = [MOCK_USERS_KEY, REGISTRATIONS_KEY, LOCAL_STORAGE_KEYS.AUTH_USER]
      const previous = keys.map((key) => localStorage.getItem(key))
      try {
        const account = registerMockUser({ name: profile.name, email, password })
        if (!account) throw new Error('Пользователь с таким email уже зарегистрирован')
        const skill: Skill = { ...offer, id: generateId(), title: offer.title.trim(), images }
        const user: User = {
          ...account,
          avatar,
          aboutMe: profile.aboutMe ?? '',
          gender: profile.gender,
          city: profile.city?.id ?? '',
          birthDate: profile.birthDate ? format(profile.birthDate, 'yyyy-MM-dd') : '',
          createdAt: new Date().toISOString(),
          likesCount: 0,
          likesCard: [],
          teach: [skill.id],
          learn: [],
          learningSubcategoryIds: [...profile.learningSkills.skillIds],
        }
        const record: RegistrationRecord = {
          user,
          skill,
          city: profile.city,
          learningCategoryIds: [...profile.learningSkills.categoryIds],
        }
        localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([...records, record]))
        const authUser = saveAuthUser(account)
        dispatch(addRegisteredUser(user))
        dispatch(addRegisteredSkill(skill))
        return { ...record, authUser }
      } catch (error) {
        // Этот участок синхронный: откат не пересекается с другим завершением регистрации.
        keys.forEach((key, index) => {
          const value = previous[index]
          if (value === null) localStorage.removeItem(key)
          else localStorage.setItem(key, value)
        })
        throw error
      }
    } catch (error) {
      if (error instanceof DOMException) {
        return rejectWithValue(
          'Не удалось сохранить данные в браузере. Проверьте доступное место и настройки хранилища.',
        )
      }
      return rejectWithValue(
        error instanceof Error ? error.message : 'Не удалось завершить регистрацию',
      )
    }
  },
)
