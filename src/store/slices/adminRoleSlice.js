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

export const fetchAdminRoles = createAsyncThunk(
  "adminRoles/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/adminRole/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchAdminRole = createAsyncThunk(
  "adminRoles/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(
        `/api/adminRole/readOne/${encodeURIComponent(id)}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createAdminRole = createAsyncThunk(
  "adminRoles/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/adminRole/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateAdminRole = createAsyncThunk(
  "adminRoles/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/adminRole/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

const initialState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

const adminRoleSlice = createSlice({
  name: "adminRoles",
  initialState,
  reducers: {
    clearAdminRoleError(state) {
      state.error = null;
    },
    setSelectedAdminRole(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchAdminRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load roles.";
      })
      .addCase(fetchAdminRole.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createAdminRole.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateAdminRole.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex(
          (item) => String(item?.id) === String(action.payload.id)
        );
        if (index >= 0) state.items[index] = updated;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("adminRoles/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearAdminRoleError, setSelectedAdminRole } = adminRoleSlice.actions;
export const selectAdminRoles = (state) => state.adminRoles.items;
export const selectAdminRolesLoading = (state) => state.adminRoles.loading;
export const selectAdminRolesError = (state) => state.adminRoles.error;
export const selectSelectedAdminRole = (state) => state.adminRoles.selected;

export default adminRoleSlice.reducer;

