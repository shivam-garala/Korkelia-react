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

export const fetchDesigns = createAsyncThunk("designs/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get("/api/designs/read");
    return data;
  } catch (error) {
    return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
  }
});

export const fetchDesign = createAsyncThunk("designs/fetchOne", async (id, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get(`/api/designs/readOne/${encodeURIComponent(id)}`);
    return { id, data };
  } catch (error) {
    return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
  }
});

export const createDesign = createAsyncThunk("designs/create", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.post("/api/designs/create", payload ?? {});
    return data;
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

const designSlice = createSlice({
  name: "designs",
  initialState,
  reducers: {
    clearDesignError(state) {
      state.error = null;
    },
    setSelectedDesign(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesigns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload?.data ?? [];
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load designs.";
      })
      .addCase(fetchDesign.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? action.payload ?? null;
      })
      .addCase(createDesign.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...(state.items ?? [])];
      })
      .addMatcher(
        (action) => action.type.startsWith("designs/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearDesignError, setSelectedDesign } = designSlice.actions;
export const selectDesigns = (state) => state.designs.items;
export const selectDesignsLoading = (state) => state.designs.loading;
export const selectDesignsError = (state) => state.designs.error;
export const selectSelectedDesign = (state) => state.designs.selected;

export default designSlice.reducer;
