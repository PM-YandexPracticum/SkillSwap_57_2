import { configureStore } from '@reduxjs/toolkit'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import authReducer from '@/features/auth/model/authSlice'
import usersReducer from '@/entities/user/model/usersSlice'
import { getProfileChanges } from '@/shared/lib/registrationStorage'
import type { User } from '@/shared/types'
import ProfilePage from './index'

vi.mock('@/shared/ui/Header/Header', () => ({ Header: () => null }))
vi.mock('@/shared/ui/Footer/Footer', () => ({ Footer: () => null }))

const user: User = {
  id: 'user_1', name: 'Иван', email: 'ivan@example.com', avatar: null,
  aboutMe: '', gender: 'male', city: 'moscow', birthDate: '1994-04-06',
  createdAt: '2025-01-01', likesCount: 0, likesCard: [], teach: [], learn: [],
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('ProfilePage', () => {
  it('saves edited data and updates both user and auth state', async () => {
    localStorage.clear()
    vi.stubGlobal('fetch', vi.fn(async (input: string) => ({
      ok: true,
      json: async () => input.includes('cities.json')
        ? [{ id: 'moscow', title: 'Москва' }]
        : [],
    })))
    const store = configureStore({
      reducer: { auth: authReducer, users: usersReducer },
      preloadedState: {
        auth: { user: { id: user.id, name: user.name, email: user.email, token: 'token123' },
          status: 'idle' as const, error: null },
        users: { items: [user], status: 'succeeded' as const, error: null },
      },
    })

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </Provider>,
    )

    fireEvent.change(screen.getByLabelText('Имя'), { target: { value: 'Пётр' } })
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => expect(getProfileChanges()[0]?.name).toBe('Пётр'))
    expect(store.getState().users.items[0].name).toBe('Пётр')
    expect(store.getState().auth.user?.name).toBe('Пётр')
    expect(screen.getByRole('status')).toHaveTextContent('Данные сохранены')
  })
})
