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

export const fetchMetalMasters = createAsyncThunk(
  "metalMaster/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/metal/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchMetalMaster = createAsyncThunk(
  "metalMaster/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/api/metal/readOne/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createMetalMaster = createAsyncThunk(
  "metalMaster/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/metal/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateMetalMaster = createAsyncThunk(
  "metalMaster/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/metal/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteMetalMaster = createAsyncThunk(
  "metalMaster/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(`/api/metal/delete/${encodeURIComponent(id)}`);
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

const metalMasterSlice = createSlice({
  name: "metalMaster",
  initialState,
  reducers: {
    clearMetalMasterError(state) {
      state.error = null;
    },
    setSelectedMetalMaster(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetalMasters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetalMasters.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : action.payload?.data ?? [];
      })
      .addCase(fetchMetalMasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load metal master.";
      })
      .addCase(fetchMetalMaster.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(createMetalMaster.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateMetalMaster.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteMetalMaster.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) => action.type.startsWith("metalMaster/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearMetalMasterError, setSelectedMetalMaster } = metalMasterSlice.actions;
export const selectMetalMasters = (state) => state.metalMaster.items;
export const selectMetalMasterLoading = (state) => state.metalMaster.loading;
export const selectMetalMasterError = (state) => state.metalMaster.error;
export const selectSelectedMetalMaster = (state) => state.metalMaster.selected;

export default metalMasterSlice.reducer;
