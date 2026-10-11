import { configureStore } from '@reduxjs/toolkit'
import usersReducer from '@/entities/user/model/usersSlice'
import skillsReducer from '@/entities/skill/model/skillsSlice'
// Импортируй свои slice'ы здесь по мере их создания:
// import authReducer from '@/features/auth/model/authSlice'

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    users: usersReducer,
    skills: skillsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
