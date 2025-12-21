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

export const fetchDiamondTypes = createAsyncThunk(
  "diamondType/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/diamondType/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchDiamondType = createAsyncThunk(
  "diamondType/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/api/diamondType/readOne/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createDiamondType = createAsyncThunk(
  "diamondType/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/diamondType/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateDiamondType = createAsyncThunk(
  "diamondType/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/diamondType/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteDiamondType = createAsyncThunk(
  "diamondType/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(
        `/api/diamondType/delete/${encodeURIComponent(id)}`
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

const diamondTypeSlice = createSlice({
  name: "diamondType",
  initialState,
  reducers: {
    clearDiamondTypeError(state) {
      state.error = null;
    },
    setSelectedDiamondType(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiamondTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiamondTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchDiamondTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load diamond types.";
      })
      .addCase(fetchDiamondType.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(createDiamondType.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateDiamondType.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteDiamondType.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) => action.type.startsWith("diamondType/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearDiamondTypeError, setSelectedDiamondType } = diamondTypeSlice.actions;
export const selectDiamondTypes = (state) => state.diamondType.items;
export const selectDiamondTypeLoading = (state) => state.diamondType.loading;
export const selectDiamondTypeError = (state) => state.diamondType.error;
export const selectSelectedDiamondType = (state) => state.diamondType.selected;

export default diamondTypeSlice.reducer;
