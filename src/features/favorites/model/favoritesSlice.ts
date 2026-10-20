import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = 'favorites'

/** Старый формат хранил id навыка; поддерживаем только id пользователя. */
const LEGACY_SKILL_ID_PREFIX = 'skill_'

interface FavoritesState {
    ids: string[]
}

const isLegacySkillId = (id: string) => id.startsWith(LEGACY_SKILL_ID_PREFIX)

const loadFavorites = (): string[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed: unknown = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.every((id) => typeof id === 'string')) {
            // Отметки старого формата сбрасываем: в избранном хранится только user.id.
            const ids = Array.from(new Set(parsed.filter((id) => !isLegacySkillId(id))))
            if (ids.length !== parsed.length) saveFavorites(ids)
            return ids
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
        /** Оставляет только те отметки, которые указывают на существующего пользователя. */
        pruneFavorites: (state, action: PayloadAction<string[]>) => {
            const validIds = new Set(action.payload)
            state.ids = state.ids.filter((id) => validIds.has(id))
        },
    },
})

export const { addFavorite, removeFavorite, pruneFavorites } = favoritesSlice.actions

export const selectFavoriteIds = (state: { favorites: FavoritesState }) => state.favorites.ids

export default favoritesSlice.reducer