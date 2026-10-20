import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/shared/types'
import { LOCAL_STORAGE_KEYS } from './constants'
import {
  getProfileChanges, PROFILE_CHANGES_KEY, readRegistrations, REGISTRATIONS_KEY,
  saveProfileChanges,
} from './registrationStorage'
import { findMockUser, MOCK_USERS_KEY } from '@/features/auth/model/authUtils'

const user = (id: string): User => ({
  id, name: id, email: `${id}@example.com`, avatar: null, aboutMe: '',
  gender: 'unspecified', city: '', birthDate: '', createdAt: '2026-01-01',
  likesCount: 0, likesCard: [], teach: [], learn: [],
})

beforeEach(() => localStorage.clear())

describe('saveProfileChanges', () => {
  it('keeps other users and updates the account, auth state and registration', () => {
    const first = { ...user('first'), teach: ['skill'] }
    const second = user('second')
    localStorage.setItem(PROFILE_CHANGES_KEY, JSON.stringify([second]))
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([
      { id: 'first', name: 'first', email: first.email, password: 'old' },
      { id: 'second', name: 'second', email: second.email, password: 'other' },
    ]))
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_USER, JSON.stringify({
      id: 'first', name: 'first', email: first.email, token: 'token123',
    }))
    const skill = { id: 'skill', title: 'Skill', category: 'cat', subcategory: 'sub', description: '', images: [] }
    localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify([
      { user: first, skill, city: null },
    ]))

    const changed = { ...first, name: 'Новое имя', email: 'new@example.com', city: 'kazan' }
    saveProfileChanges(changed, 'new-password')

    expect(getProfileChanges()).toEqual([second, changed])
    expect(readRegistrations()[0].user).toEqual(changed)
    expect(findMockUser('new@example.com', 'new-password')?.name).toBe('Новое имя')
    expect(findMockUser(first.email, 'old')).toBeNull()
    expect(findMockUser(second.email, 'other')?.id).toBe('second')
    expect(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER)!)).toMatchObject({
      name: 'Новое имя', email: 'new@example.com',
    })
  })

  it('restores storage when writing the changed profile fails', () => {
    const initial = user('first')
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([
      { id: 'first', name: 'first', email: initial.email, password: 'old' },
    ]))
    const originalSetItem = Storage.prototype.setItem
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === PROFILE_CHANGES_KEY) throw new Error('Storage is full')
      return originalSetItem.call(this, key, value)
    })
    expect(() => saveProfileChanges({ ...initial, name: 'Changed' })).toThrow('Storage is full')
    spy.mockRestore()
    expect(findMockUser(initial.email, 'old')?.name).toBe('first')
    expect(getProfileChanges()).toEqual([])
  })
})
