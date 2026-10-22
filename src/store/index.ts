import { configureStore } from '@reduxjs/toolkit'
import { skillFilterReducer } from '@/shared/ui/FilterPanel/SkillFilter/model/skillFilterSlice'
import usersReducer from '@/entities/user/model/usersSlice'
import skillsReducer from '@/entities/skill/model/skillsSlice'
import authReducer, { setUserFromStorage } from '@/features/auth/model/authSlice'
import citiesReducer from '@/entities/city/model/citiesSlice'
import favoritesReducer from '@/features/favorites/model/favoritesSlice'
import { localStorageMiddleware } from './middleware'
import { getAuthUser } from '@/features/auth/model/authUtils'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    skills: skillsReducer,
    skillFilter: skillFilterReducer,
    cities: citiesReducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware.middleware),
})

// запускаем логику чтения пользователя из хранилища после создания store,
// чтобы запустились middlewares для favorites
store.dispatch(setUserFromStorage(getAuthUser()))

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
