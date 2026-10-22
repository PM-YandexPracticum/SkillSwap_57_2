import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchUsers as apiFetchUsers } from "@/api/users";
import {
  getRegisteredItems,
  mergeById,
} from "@/shared/lib/registrationStorage";
import type { User } from "./types";

interface UsersState {
  items: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UsersState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: string }
>("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const users = await apiFetchUsers();
    const registeredUsers = getRegisteredItems().users;
    return mergeById(users, registeredUsers);
  } catch (error) {
    return rejectWithValue(
      error instanceof Error
        ? error.message
        : "Не удалось загрузить пользователей",
    );
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addRegisteredUser: (state, action: PayloadAction<User>) => {
      const userIndex = state.items.findIndex(
        (user) => user.id === action.payload.id,
      );

      if (userIndex >= 0) {
        state.items[userIndex] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export const { addRegisteredUser } = usersSlice.actions;
export default usersSlice.reducer;
