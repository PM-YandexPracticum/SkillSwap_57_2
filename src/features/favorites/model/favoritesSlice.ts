import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface FavoritesState {
    ids: string[]
}

const initialState: FavoritesState = {
    ids: [],
}

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addFavorite: (state, action: PayloadAction<string>) => {
            if (!state.ids.includes(action.payload)) {
                state.ids.push(action.payload)
            }
        },
        removeFavorite: (state, action: PayloadAction<string>) => {
            state.ids = state.ids.filter((id) => id !== action.payload)
        },
        setFavorites: (state, action: PayloadAction<string[]>) => {
            state.ids = action.payload
        },
        resetFavoritesWhenExit: () => {
            return initialState
        },
    },
})

export const { addFavorite, removeFavorite, setFavorites, resetFavoritesWhenExit } =
    favoritesSlice.actions

export const selectFavoriteIds = (state: { favorites: FavoritesState }) => state.favorites.ids

export default favoritesSlice.reducer
