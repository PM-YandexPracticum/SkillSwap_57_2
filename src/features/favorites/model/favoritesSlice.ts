import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = 'favorites'

interface FavoritesState {
    ids: string[]
}

const loadFavorites = (): string[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')) {
            return Array.from(new Set(parsed))
        }
        return []
    } catch {
        return []
    }
}

export const saveFavorites = (ids: string[]): boolean => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
        return true
    } catch {
        return false
    }
}

const initialState: FavoritesState = {
    ids: loadFavorites(),
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
    },
})

export const { addFavorite, removeFavorite } = favoritesSlice.actions

export const selectFavoriteIds = (state: { favorites: FavoritesState }) => state.favorites.ids

export default favoritesSlice.reducer