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

export const fetchDiamondClarities = createAsyncThunk(
  "diamondClarity/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/diamondClarity/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchDiamondClarity = createAsyncThunk(
  "diamondClarity/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(
        `/api/diamondClarity/readOne/${encodeURIComponent(id)}`
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createDiamondClarity = createAsyncThunk(
  "diamondClarity/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/diamondClarity/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateDiamondClarity = createAsyncThunk(
  "diamondClarity/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/diamondClarity/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteDiamondClarity = createAsyncThunk(
  "diamondClarity/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(
        `/api/diamondClarity/delete/${encodeURIComponent(id)}`
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

const diamondClaritySlice = createSlice({
  name: "diamondClarity",
  initialState,
  reducers: {
    clearDiamondClarityError(state) {
      state.error = null;
    },
    setSelectedDiamondClarity(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiamondClarities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiamondClarities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchDiamondClarities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load diamond clarities.";
      })
      .addCase(fetchDiamondClarity.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(createDiamondClarity.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateDiamondClarity.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteDiamondClarity.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) => action.type.startsWith("diamondClarity/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearDiamondClarityError, setSelectedDiamondClarity } = diamondClaritySlice.actions;
export const selectDiamondClarities = (state) => state.diamondClarity.items;
export const selectDiamondClarityLoading = (state) => state.diamondClarity.loading;
export const selectDiamondClarityError = (state) => state.diamondClarity.error;
export const selectSelectedDiamondClarity = (state) => state.diamondClarity.selected;

export default diamondClaritySlice.reducer;
