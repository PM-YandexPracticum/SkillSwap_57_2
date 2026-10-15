import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Skill } from './types'
import { getRegisteredItems, mergeById } from '@/shared/lib/registrationStorage'

interface SkillsState {
  items: Skill[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: SkillsState = {
  items: getRegisteredItems().skills,
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
  reducers: {
    addRegisteredSkill: (state, action: PayloadAction<Skill>) => {
      state.items = mergeById(state.items, [action.payload])
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSkills.fulfilled, (state, action: PayloadAction<Skill[]>) => {
        state.status = 'succeeded'
        state.items = mergeById(action.payload, getRegisteredItems().skills)
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error'
      })
  },
})

export const { addRegisteredSkill } = skillsSlice.actions
export default skillsSlice.reducer
