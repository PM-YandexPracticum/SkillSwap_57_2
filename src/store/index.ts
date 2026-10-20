import { configureStore } from '@reduxjs/toolkit'
import { skillFilterReducer } from '@/shared/ui/FilterPanel/SkillFilter/model/skillFilterSlice'
import usersReducer from '@/entities/user/model/usersSlice'
import skillsReducer from '@/entities/skill/model/skillsSlice'
import authReducer from '@/features/auth/model/authSlice'
import citiesReducer from '@/entities/city/model/citiesSlice'
import favoritesReducer, { saveFavorites } from '@/features/favorites/model/favoritesSlice'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'
import requestReducer from '@/features/requests/model/requestSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    skills: skillsReducer,
    skillFilter: skillFilterReducer,
    cities: citiesReducer,
    favorites: favoritesReducer,
    requests: requestReducer,
  },
})

let previousFavoriteIds = store.getState().favorites.ids
let previousRequests = store.getState().requests.items

store.subscribe(() => {
  const currentFavoriteIds = store.getState().favorites.ids
  if (currentFavoriteIds !== previousFavoriteIds) {
    previousFavoriteIds = currentFavoriteIds
    saveFavorites(currentFavoriteIds)
  }
  const currentRequests = store.getState().requests.items
  if (currentRequests !== previousRequests) {
    previousRequests = currentRequests
    localStorage.setItem(LOCAL_STORAGE_KEYS.REQUESTS, JSON.stringify(currentRequests))
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

