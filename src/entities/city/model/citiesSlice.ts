import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { City } from './types'
import { fetchCities } from '@/api/cities'

interface CitiesState {
  items: City[]
  loading: boolean
  error: string | null
}

const initialState: CitiesState = {
  items: [],
  loading: false,
  error: null,
}

export const loadCities = createAsyncThunk<City[], void, { rejectValue: string }>(
  'cities/loadCities',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCities()
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error')
    }
  },
)

const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCities.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadCities.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(loadCities.rejected, (state) => {
        state.loading = false
        state.error = 'Не удалось загрузить города'
      })
  },
})

export default citiesSlice.reducer
