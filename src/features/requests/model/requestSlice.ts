import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { SwapRequest } from '@/entities/request/model/types'
import { LOCAL_STORAGE_KEYS } from '@/shared/lib/constants'

interface RequestsState {
  items: SwapRequest[]
}

const loadRequests = (): SwapRequest[] => {
  try {
    const savedRequests = localStorage.getItem(LOCAL_STORAGE_KEYS.REQUESTS)
    return savedRequests ? (JSON.parse(savedRequests) as SwapRequest[]) : []
  } catch {
    return []
  }
}

const initialState: RequestsState = {
  items: loadRequests(),
}

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    createRequest: {
      prepare(skillId: string, fromUserId: string, toUserId: string) {
        const now = new Date().toISOString()

        return {
          payload: {
            id: nanoid(),
            skillId,
            fromUserId,
            toUserId,
            status: 'pending' as const,
            createdAt: now,
            updatedAt: now,
          },
        }
      },
      reducer(state, action: { payload: SwapRequest }) {
        state.items.unshift(action.payload)
      },
    },
  },
})

export const { createRequest } = requestSlice.actions
export default requestSlice.reducer
