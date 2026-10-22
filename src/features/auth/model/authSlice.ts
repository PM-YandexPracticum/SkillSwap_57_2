import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '@/shared/types'
import { registerUser } from './registerUser'
import { clearAuthUser, findMockUser, saveAuthUser } from './authUtils'

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

export interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading'
  error: string | null
}

// Авторизация восстанавливается из localStorage при загрузке приложения.
const initialState: AuthState = {
  user: null,
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

/** Выход: завершает текущую авторизацию. */
export const logout = createAsyncThunk('auth/logout', async () => {
  clearAuthUser()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuthUser: (state, action: PayloadAction<{ id: string; name: string; email: string }>) => {
      if (state.user?.id === action.payload.id) {
        state.user.name = action.payload.name
        state.user.email = action.payload.email
      }
    },
    setUserFromStorage: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
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
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.status = 'idle'
        state.error = null
      })
  },
})

export const { updateAuthUser, setUserFromStorage, clearAuthError } = authSlice.actions
export default authSlice.reducer
