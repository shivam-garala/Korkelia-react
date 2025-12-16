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

export const fetchCutMasters = createAsyncThunk(
  "cutMaster/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/cutMaster/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchCutMaster = createAsyncThunk(
  "cutMaster/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/api/cutMaster/readOne/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createCutMaster = createAsyncThunk(
  "cutMaster/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/cutMaster/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateCutMaster = createAsyncThunk(
  "cutMaster/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/cutMaster/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteCutMaster = createAsyncThunk(
  "cutMaster/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(`/api/cutMaster/delete/${encodeURIComponent(id)}`);
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

const cutMasterSlice = createSlice({
  name: "cutMaster",
  initialState,
  reducers: {
    clearCutMasterError(state) {
      state.error = null;
    },
    setSelectedCutMaster(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCutMasters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCutMasters.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchCutMasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load cut master.";
      })
      .addCase(fetchCutMaster.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(createCutMaster.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateCutMaster.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteCutMaster.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) => action.type.startsWith("cutMaster/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearCutMasterError, setSelectedCutMaster } = cutMasterSlice.actions;
export const selectCutMasters = (state) => state.cutMaster.items;
export const selectCutMasterLoading = (state) => state.cutMaster.loading;
export const selectCutMasterError = (state) => state.cutMaster.error;
export const selectSelectedCutMaster = (state) => state.cutMaster.selected;

export default cutMasterSlice.reducer;

