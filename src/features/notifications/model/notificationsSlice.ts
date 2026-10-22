import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

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
  },
})

export const { addExchangeNotification, markNotificationAsRead } = notificationsSlice.actions

export default notificationsSlice.reducer
