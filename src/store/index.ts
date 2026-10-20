import { configureStore } from '@reduxjs/toolkit'
import { skillFilterReducer } from '@/shared/ui/FilterPanel/SkillFilter/model/skillFilterSlice'
import usersReducer from '@/entities/user/model/usersSlice'
import skillsReducer from '@/entities/skill/model/skillsSlice'
import authReducer from '@/features/auth/model/authSlice'
import citiesReducer from '@/entities/city/model/citiesSlice'
import favoritesReducer, {
  pruneFavorites,
  saveFavorites,
} from '@/features/favorites/model/favoritesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    skills: skillsReducer,
    skillFilter: skillFilterReducer,
    cities: citiesReducer,
    favorites: favoritesReducer,
  },
})

let previousFavoriteIds = store.getState().favorites.ids
store.subscribe(() => {
  const state = store.getState()
  const currentFavoriteIds = state.favorites.ids
  if (currentFavoriteIds !== previousFavoriteIds) {
    previousFavoriteIds = currentFavoriteIds
    saveFavorites(currentFavoriteIds)
  }

  // В избранном хранятся только id пользователей. Когда справочник загружен,
  // вычищаем отметки старого формата (id навыков), не трогая аккаунты и регистрации.
  if (state.users.status === 'succeeded') {
    const userIds = new Set(state.users.items.map((user) => user.id))
    const validIds = state.favorites.ids.filter((id) => userIds.has(id))
    if (validIds.length !== state.favorites.ids.length) {
      store.dispatch(pruneFavorites(validIds))
    }
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

