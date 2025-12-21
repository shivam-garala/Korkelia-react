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

export const fetchGoldColors = createAsyncThunk(
  "goldColor/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/goldColor/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchGoldColor = createAsyncThunk(
  "goldColor/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/api/goldColor/readOne/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createGoldColor = createAsyncThunk(
  "goldColor/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/goldColor/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateGoldColor = createAsyncThunk(
  "goldColor/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/goldColor/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteGoldColor = createAsyncThunk(
  "goldColor/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(`/api/goldColor/delete/${encodeURIComponent(id)}`);
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

const goldColorSlice = createSlice({
  name: "goldColor",
  initialState,
  reducers: {
    clearGoldColorError(state) {
      state.error = null;
    },
    setSelectedGoldColor(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoldColors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoldColors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchGoldColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load gold colors.";
      })
      .addCase(fetchGoldColor.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(createGoldColor.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateGoldColor.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteGoldColor.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) => action.type.startsWith("goldColor/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearGoldColorError, setSelectedGoldColor } = goldColorSlice.actions;
export const selectGoldColors = (state) => state.goldColor.items;
export const selectGoldColorLoading = (state) => state.goldColor.loading;
export const selectGoldColorError = (state) => state.goldColor.error;
export const selectSelectedGoldColor = (state) => state.goldColor.selected;

export default goldColorSlice.reducer;
