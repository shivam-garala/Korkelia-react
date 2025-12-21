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

export const fetchDiamondRates = createAsyncThunk(
  "diamondRate/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/diamondRate/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchDiamondRate = createAsyncThunk(
  "diamondRate/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/api/diamondRate/readOne/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createDiamondRate = createAsyncThunk(
  "diamondRate/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/diamondRate/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateDiamondRate = createAsyncThunk(
  "diamondRate/update",
  async ({ id, payload }, { rejectWithValue }) => {
    console.log(payload);
    
    try {
      const { data } = await axiosClient.put(
        `/api/diamondRate/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      console.log(data);
      
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteDiamondRate = createAsyncThunk(
  "diamondRate/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(`/api/diamondRate/delete/${encodeURIComponent(id)}`);
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

const diamondRateSlice = createSlice({
  name: "diamondRate",
  initialState,
  reducers: {
    clearDiamondRateError(state) {
      state.error = null;
    },
    setSelectedDiamondRate(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiamondRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiamondRates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchDiamondRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load diamond rates.";
      })
      .addCase(fetchDiamondRate.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(createDiamondRate.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateDiamondRate.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteDiamondRate.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) => action.type.startsWith("diamondRate/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearDiamondRateError, setSelectedDiamondRate } = diamondRateSlice.actions;
export const selectDiamondRates = (state) => state.diamondRate.items;
export const selectDiamondRateLoading = (state) => state.diamondRate.loading;
export const selectDiamondRateError = (state) => state.diamondRate.error;
export const selectSelectedDiamondRate = (state) => state.diamondRate.selected;

export default diamondRateSlice.reducer;
