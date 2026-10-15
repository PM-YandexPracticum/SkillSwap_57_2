import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { AuthUser } from '@/shared/types'
import { registerUser } from './registerUser'
import {
  clearAuthUser,
  findMockUser,
  getAuthUser,
  registerMockUser,
  saveAuthUser,
} from './authUtils'

/** Сообщение об ошибке при неверных учётных данных. */
export const INVALID_CREDENTIALS_MESSAGE =
  'Email или пароль введён неверно. Пожалуйста проверьте правильность введённых данных'

/** Сообщение об ошибке, если email уже занят. */
export const EMAIL_ALREADY_USED_MESSAGE = 'Пользователь с таким email уже зарегистрирован'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading'
  error: string | null
}

// Авторизация восстанавливается из localStorage при загрузке приложения.
const initialState: AuthState = {
  user: getAuthUser(),
  status: 'idle',
  error: null,
}

/** Имитация сетевой задержки, мс */
const MOCK_DELAY = 400

/** Вход по email и паролю. Сохраняет пользователя и mock-токен. */
export const login = createAsyncThunk<AuthUser, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))

    const user = findMockUser(email, password)
    if (!user) return rejectWithValue(INVALID_CREDENTIALS_MESSAGE)

    return saveAuthUser(user)
  },
)

/** Регистрация нового пользователя. Сразу авторизует его. */
export const register = createAsyncThunk<AuthUser, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY))

    const user = registerMockUser({ name, email, password })
    if (!user) return rejectWithValue(EMAIL_ALREADY_USED_MESSAGE)

    return saveAuthUser(user)
  },
)

/** Выход: завершает текущую авторизацию. */
export const logout = createAsyncThunk('auth/logout', async () => {
  clearAuthUser()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload.authUser
        state.status = 'idle'
        state.error = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload ?? 'Не удалось завершить регистрацию'
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload ?? INVALID_CREDENTIALS_MESSAGE
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'idle'
        state.error = action.payload ?? EMAIL_ALREADY_USED_MESSAGE
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.status = 'idle'
        state.error = null
      })
  },
})

export default authSlice.reducer
