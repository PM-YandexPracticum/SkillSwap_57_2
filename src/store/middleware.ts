import { createListenerMiddleware } from '@reduxjs/toolkit'
import { RootState } from '.'
import { resetFavoritesWhenExit, setFavorites } from '@/features/favorites/model/favoritesSlice'

const getFavoritesStorageKey = (userId: string) => `favorites_${userId}`

const saveFavoritesToStorage = (userId: string, ids: string[]) => {
  localStorage.setItem(getFavoritesStorageKey(userId), JSON.stringify(ids))
}

export const localStorageMiddleware = createListenerMiddleware()

// сохраняем, если произошло изменение favorites.ids
localStorageMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    const current = currentState as RootState
    const previous = previousState as RootState

    // не перезатираем хранилище, если пользователь вышел
    if (action.type === resetFavoritesWhenExit.type) {
      return false
    }

    return current.favorites.ids !== previous.favorites.ids
  },
  effect: (_, listenerApi) => {
    const {
      favorites: { ids },
      auth: { user },
    } = listenerApi.getState() as RootState

    if (user?.id) {
      saveFavoritesToStorage(user.id, ids)
    }
  },
})

// читаем, если произошло изменение auth.user.id
localStorageMiddleware.startListening({
  predicate: (_, currentState, previousState) => {
    const current = currentState as RootState
    const previous = previousState as RootState
    return current.auth.user?.id !== previous.auth.user?.id
  },
  effect: (_, listenerApi) => {
    const {
      auth: { user },
    } = listenerApi.getState() as RootState
    if (user?.id) {
      // читаем favorites
      try {
        const raw = localStorage.getItem(getFavoritesStorageKey(user.id))
        if (!raw) {
          listenerApi.dispatch(setFavorites([]))
          return
        }
        const favorites: unknown = JSON.parse(raw)
        if (Array.isArray(favorites) && favorites.every((id) => typeof id === 'string')) {
          listenerApi.dispatch(setFavorites(Array.from(new Set(favorites))))
          return
        }
        listenerApi.dispatch(setFavorites([]))
      } catch {
        listenerApi.dispatch(setFavorites([]))
      }
    } else {
      // очищаем favorites, если пользователь вышел
      listenerApi.dispatch(resetFavoritesWhenExit())
    }
  },
})
