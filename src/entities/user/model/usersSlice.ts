import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from './types'
import { getRegisteredItems, mergeById } from '@/shared/lib/registrationStorage'

interface UsersState {
  items: User[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: UsersState = {
  items: getRegisteredItems().users,
  status: 'idle',
  error: null,
}

export const fetchUsers = createAsyncThunk<User[], void, { rejectValue: string }>(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/db/users.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as User[]
    } catch (e) {
      return rejectWithValue((e as Error).message)
    }
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addRegisteredUser: (state, action: PayloadAction<User>) => {
      state.items = mergeById(state.items, [action.payload])
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = 'succeeded'
        state.items = mergeById(action.payload, getRegisteredItems().users)
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error'
      })
  },
})

export const { addRegisteredUser } = usersSlice.actions
export default usersSlice.reducer
