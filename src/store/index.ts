import { configureStore } from '@reduxjs/toolkit'
import { skillFilterReducer } from '@/shared/ui/FilterPanel/SkillFilter/model/skillFilterSlice'
import usersReducer from '@/entities/user/model/usersSlice'
import skillsReducer from '@/entities/skill/model/skillsSlice'
import authReducer from '@/features/auth/model/authSlice'
import citiesReducer from '@/entities/city/model/citiesSlice'
import favoritesReducer, { saveFavorites } from '@/features/favorites/model/favoritesSlice'

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
  const currentFavoriteIds = store.getState().favorites.ids
  if (currentFavoriteIds !== previousFavoriteIds) {
    previousFavoriteIds = currentFavoriteIds
    saveFavorites(currentFavoriteIds)
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

