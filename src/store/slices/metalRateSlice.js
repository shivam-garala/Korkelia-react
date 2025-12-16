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

export const fetchKarats = createAsyncThunk(
  "metalRates/fetchKarats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/metalRateMaster/karat-read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchMetalRates = createAsyncThunk(
  "metalRates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/metalRateMaster/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createMetalRate = createAsyncThunk(
  "metalRates/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/metalRateMaster/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

const initialState = {
  items: [],
  karats: [],
  loading: false,
  error: null,
};

const metalRateSlice = createSlice({
  name: "metalRates",
  initialState,
  reducers: {
    clearMetalRateError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKarats.fulfilled, (state, action) => {
        state.karats = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchMetalRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetalRates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchMetalRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load metal rates.";
      })
      .addCase(createMetalRate.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("metalRates/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearMetalRateError } = metalRateSlice.actions;
export const selectMetalRates = (state) => state.metalRates.items;
export const selectKarats = (state) => state.metalRates.karats;
export const selectMetalRatesLoading = (state) => state.metalRates.loading;
export const selectMetalRatesError = (state) => state.metalRates.error;

export default metalRateSlice.reducer;

