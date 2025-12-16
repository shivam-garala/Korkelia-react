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

export const fetchStyleMasters = createAsyncThunk(
  "styleMaster/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/styleMaster/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchStyleMaster = createAsyncThunk(
  "styleMaster/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/api/styleMaster/readOne/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createStyleMaster = createAsyncThunk(
  "styleMaster/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/styleMaster/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateStyleMaster = createAsyncThunk(
  "styleMaster/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/styleMaster/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteStyleMaster = createAsyncThunk(
  "styleMaster/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(`/api/styleMaster/delete/${encodeURIComponent(id)}`);
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

const styleMasterSlice = createSlice({
  name: "styleMaster",
  initialState,
  reducers: {
    clearStyleMasterError(state) {
      state.error = null;
    },
    setSelectedStyleMaster(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStyleMasters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStyleMasters.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchStyleMasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load style master.";
      })
      .addCase(fetchStyleMaster.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(createStyleMaster.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateStyleMaster.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteStyleMaster.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("styleMaster/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearStyleMasterError, setSelectedStyleMaster } = styleMasterSlice.actions;
export const selectStyleMasters = (state) => state.styleMaster.items;
export const selectStyleMasterLoading = (state) => state.styleMaster.loading;
export const selectStyleMasterError = (state) => state.styleMaster.error;
export const selectSelectedStyleMaster = (state) => state.styleMaster.selected;

export default styleMasterSlice.reducer;

