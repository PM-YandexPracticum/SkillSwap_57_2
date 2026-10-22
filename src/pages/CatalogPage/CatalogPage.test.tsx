import { configureStore } from '@reduxjs/toolkit'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '@/shared/types'
import authReducer from '@/features/auth/model/authSlice'
import favoritesReducer from '@/features/favorites/model/favoritesSlice'
import { SearchQueryContext } from '@/features/search/model/searchQueryContext'
import skillsReducer from '@/entities/skill/model/skillsSlice'
import usersReducer from '@/entities/user/model/usersSlice'
import citiesReducer from '@/entities/city/model/citiesSlice'
import { skillFilterReducer } from '@/shared/ui/FilterPanel/SkillFilter/model/skillFilterSlice'
import CatalogPage from './index'

vi.mock('@/shared/ui/Card', () => ({
  Card: ({ user }: { user: User }) => <div data-testid="catalog-card">{user.id}</div>,
}))

const cities = [
  { id: 'moscow', title: 'Москва' },
  { id: 'kazan', title: 'Казань' },
]
const skill = {
  id: 'skill_1', title: 'Игра на гитаре', category: 'Творчество и искусство',
  subcategory: 'Музыка и звук', description: '', images: [],
}
const otherSkill = {
  id: 'skill_2', title: 'Управление командой', category: 'Бизнес и карьера',
  subcategory: 'Управление командой', description: '', images: [],
}
const users: User[] = Array.from({ length: 9 }, (_, index) => ({
  id: `user_${index}`, name: `User ${index}`, email: `user${index}@example.com`,
  avatar: null, aboutMe: '', gender: index < 4 ? 'male' : 'female',
  city: index < 4 ? 'moscow' : 'kazan', birthDate: '', createdAt: '2026-01-01',
  likesCount: index, likesCard: [], teach: [index === 8 ? otherSkill.id : skill.id], learn: [],
}))

function makeStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      users: usersReducer,
      skills: skillsReducer,
      cities: citiesReducer,
      favorites: favoritesReducer,
      skillFilter: skillFilterReducer,
    },
    preloadedState: {
      auth: { user: null, status: 'idle' as const, error: null },
      users: { items: users, status: 'succeeded' as const, error: null },
      skills: { items: [skill, otherSkill], status: 'succeeded' as const, error: null },
      cities: { items: cities, loading: false, error: null },
      favorites: { ids: [] },
      skillFilter: { selectedSkillIds: [], expandedCategoryIds: [], isAllCategoriesOpen: false },
    },
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => cities })))
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    disconnect() {}
  })
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('CatalogPage results', () => {
  it('switches between home sections, one search result section, and the empty state', async () => {
    const store = makeStore()
    const page = (searchValue: string) => (
      <Provider store={store}>
        <MemoryRouter>
          <SearchQueryContext.Provider value={{ searchValue, setSearchValue: vi.fn() }}>
            <CatalogPage />
          </SearchQueryContext.Provider>
        </MemoryRouter>
      </Provider>
    )
    const view = render(page(''))
    expect(screen.getByText('Популярное')).toBeInTheDocument()
    expect(screen.getByText('Новое')).toBeInTheDocument()
    expect(screen.getByText('Рекомендуем')).toBeInTheDocument()

    view.rerender(page('гитаре'))
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 8')).toBeInTheDocument())
    expect(screen.getAllByTestId('catalog-card')).toHaveLength(6)
    expect(screen.queryByText('Популярное')).not.toBeInTheDocument()

    view.rerender(page('нет совпадений'))
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 0')).toBeInTheDocument())
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()

    view.rerender(page(''))
    await waitFor(() => expect(screen.getByText('Популярное')).toBeInTheDocument())
    expect(screen.queryByText('Подходящие предложения: 0')).not.toBeInTheDocument()
  })

  it('combines search and filters, then removes a chip and resets filters without clearing search', async () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchQueryContext.Provider value={{ searchValue: 'гитаре', setSearchValue: vi.fn() }}>
            <CatalogPage />
          </SearchQueryContext.Provider>
        </MemoryRouter>
      </Provider>,
    )
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 8')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('radio', { name: 'Женский' }))
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 4')).toBeInTheDocument())
    const chips = screen.getByLabelText('Выбранные фильтры')
    expect(within(chips).getByRole('button', { name: 'Снять фильтр: Женский' })).toBeInTheDocument()
    fireEvent.click(within(chips).getByRole('button', { name: 'Снять фильтр: Женский' }))
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 8')).toBeInTheDocument())
    expect(screen.getByRole('radio', { name: 'Не имеет значения' })).toBeChecked()

    const panel = screen.getByLabelText('Панель фильтров')
    fireEvent.click(await within(panel).findByText('Казань'))
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 4')).toBeInTheDocument())
    expect(within(screen.getByLabelText('Выбранные фильтры'))
      .getByRole('button', { name: 'Снять фильтр: Казань' })).toBeInTheDocument()
    fireEvent.click(within(screen.getByLabelText('Выбранные фильтры'))
      .getByRole('button', { name: 'Снять фильтр: Казань' }))
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 8')).toBeInTheDocument())

    fireEvent.click(within(panel).getByText('Творчество и искусство'))
    fireEvent.click(within(panel).getByText('Музыка и звук'))
    expect(within(screen.getByLabelText('Выбранные фильтры'))
      .getByRole('button', { name: 'Снять фильтр: Музыка и звук' })).toBeInTheDocument()
    fireEvent.click(within(screen.getByLabelText('Выбранные фильтры'))
      .getByRole('button', { name: 'Снять фильтр: Музыка и звук' }))
    await waitFor(() => expect(screen.queryByLabelText('Выбранные фильтры')).not.toBeInTheDocument())

    fireEvent.click(screen.getByRole('radio', { name: 'Мужской' }))
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 4')).toBeInTheDocument())
    fireEvent.click(within(panel).getByText('Казань'))
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 0')).toBeInTheDocument())
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }))
    await waitFor(() => expect(screen.getByText('Подходящие предложения: 8')).toBeInTheDocument())
    expect(screen.queryByLabelText('Выбранные фильтры')).not.toBeInTheDocument()
    expect(screen.queryByText('Популярное')).not.toBeInTheDocument()
  })
})
