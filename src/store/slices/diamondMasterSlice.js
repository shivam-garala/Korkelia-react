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

export const fetchDiamondMasters = createAsyncThunk(
  "diamondMaster/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/diamondMaster/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchDiamondMaster = createAsyncThunk(
  "diamondMaster/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/api/diamondMaster/readOne/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createDiamondMaster = createAsyncThunk(
  "diamondMaster/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/diamondMaster/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateDiamondMaster = createAsyncThunk(
  "diamondMaster/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/diamondMaster/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteDiamondMaster = createAsyncThunk(
  "diamondMaster/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(`/api/diamondMaster/delete/${encodeURIComponent(id)}`);
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

const diamondMasterSlice = createSlice({
  name: "diamondMaster",
  initialState,
  reducers: {
    clearDiamondMasterError(state) {
      state.error = null;
    },
    setSelectedDiamondMaster(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiamondMasters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiamondMasters.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchDiamondMasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load diamond master.";
      })
      .addCase(fetchDiamondMaster.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(createDiamondMaster.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateDiamondMaster.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteDiamondMaster.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("diamondMaster/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearDiamondMasterError, setSelectedDiamondMaster } = diamondMasterSlice.actions;
export const selectDiamondMasters = (state) => state.diamondMaster.items;
export const selectDiamondMasterLoading = (state) => state.diamondMaster.loading;
export const selectDiamondMasterError = (state) => state.diamondMaster.error;
export const selectSelectedDiamondMaster = (state) => state.diamondMaster.selected;

export default diamondMasterSlice.reducer;

