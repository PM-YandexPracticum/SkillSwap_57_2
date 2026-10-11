import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Skill } from './types'

interface SkillsState {
  items: Skill[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: SkillsState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchSkills = createAsyncThunk<Skill[], void, { rejectValue: string }>(
  'skills/fetchSkills',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/db/skills.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as Skill[]
    } catch (e) {
      return rejectWithValue((e as Error).message)
    }
  },
)

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSkills.fulfilled, (state, action: PayloadAction<Skill[]>) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error'
      })
  },
})

export default skillsSlice.reducer
