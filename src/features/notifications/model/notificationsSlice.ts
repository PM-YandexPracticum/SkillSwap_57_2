import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { login, logout, setUserFromStorage } from '@/features/auth/model/authSlice'
import { registerUser } from '@/features/auth/model/registerUser'

interface ExchangeNotification {
  id: string
  skillId: string
  authorId: string
  authorName: string
  isRead: boolean
}

interface NotificationsState {
  items: ExchangeNotification[]
}

const initialState: NotificationsState = {
  items: [],
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addExchangeNotification: {
      prepare(skillId: string, authorId: string, authorName: string) {
        return {
          payload: {
            id: nanoid(),
            skillId,
            authorId,
            authorName,
            isRead: false,
          },
        }
      },
      reducer(state, action: PayloadAction<ExchangeNotification>) {
        state.items.unshift(action.payload)
      },
    },

    markNotificationAsRead(state, action: PayloadAction<string>) {
      const notification = state.items.find((item) => item.id === action.payload)

      if (notification) {
        notification.isRead = true
      }
    },

    clearNotifications(state) {
      state.items = []
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => {
        state.items = []
      })
      .addCase(login.fulfilled, (state) => {
        state.items = []
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.items = []
      })
      .addCase(setUserFromStorage, (state) => {
        state.items = []
      })
  },
})

export const { addExchangeNotification, markNotificationAsRead, clearNotifications } =
  notificationsSlice.actions

export default notificationsSlice.reducer
