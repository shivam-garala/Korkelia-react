import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../../lib/axiosClient.js";

function normalizeError(error) {
  if (typeof error === "string") return error;
  return error?.message ?? "Request failed.";
}

function axiosErrorMessage(error, fallback) {
  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    null;
  return message || fallback;
}

export const fetchUsers = createAsyncThunk("users/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get("/api/admin/read");
    return data;
  } catch (error) {
    return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
  }
});

export const fetchUser = createAsyncThunk("users/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get(`/api/admin/readone/${encodeURIComponent(id)}`);
    return data;
  } catch (error) {
    return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
  }
});

export const createUser = createAsyncThunk("users/create", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.post("/api/admin/create", payload ?? {});
    return data;
  } catch (error) {
    return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
  }
});

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(`/api/admin/update/${encodeURIComponent(id)}`, payload ?? {});
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteUser = createAsyncThunk("users/delete", async (id, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.delete(`/api/admin/delete/${encodeURIComponent(id)}`);
    return { id, data };
  } catch (error) {
    return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
  }
});

const initialState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    },
    setSelectedUser(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload?.data ?? [];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load users.";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) => action.type.startsWith("users/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearUserError, setSelectedUser } = userSlice.actions;
export const selectUsers = (state) => state.users.items;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectSelectedUser = (state) => state.users.selected;

export default userSlice.reducer;
