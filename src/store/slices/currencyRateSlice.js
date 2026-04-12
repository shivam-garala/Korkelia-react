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

export const fetchCurrencyRates = createAsyncThunk(
  "currencyRates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/currencyRate/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchCurrencyRate = createAsyncThunk(
  "currencyRates/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(
        `/api/currencyRate/readOne/${encodeURIComponent(id)}`
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createCurrencyRate = createAsyncThunk(
  "currencyRates/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/currencyRate/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateCurrencyRate = createAsyncThunk(
  "currencyRates/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/currencyRate/update/${encodeURIComponent(id)}`,
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

const currencyRateSlice = createSlice({
  name: "currencyRates",
  initialState,
  reducers: {
    clearCurrencyRateError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencyRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrencyRates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchCurrencyRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load currency rates.";
      })
      .addCase(fetchCurrencyRate.fulfilled, (state, action) => {
        state.selected = action.payload?.data?.data ?? action.payload?.data ?? null;
      })
      .addCase(createCurrencyRate.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateCurrencyRate.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex(
          (item) => String(item?.id) === String(action.payload.id)
        );
        if (index >= 0) state.items[index] = updated;
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("currencyRates/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearCurrencyRateError } = currencyRateSlice.actions;
export const selectCurrencyRates = (state) => state.currencyRates.items;
export const selectCurrencyRatesLoading = (state) => state.currencyRates.loading;
export const selectCurrencyRatesError = (state) => state.currencyRates.error;
export const selectSelectedCurrencyRate = (state) => state.currencyRates.selected;

export default currencyRateSlice.reducer;

