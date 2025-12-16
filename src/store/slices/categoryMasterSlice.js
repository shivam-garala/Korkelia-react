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

export const fetchCategoryMasters = createAsyncThunk(
  "categoryMaster/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/categoryMaster/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchCategoryMaster = createAsyncThunk(
  "categoryMaster/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(
        `/api/categoryMaster/readOne/${encodeURIComponent(id)}`
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createCategoryMaster = createAsyncThunk(
  "categoryMaster/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/categoryMaster/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateCategoryMaster = createAsyncThunk(
  "categoryMaster/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/categoryMaster/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteCategoryMaster = createAsyncThunk(
  "categoryMaster/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(
        `/api/categoryMaster/delete/${encodeURIComponent(id)}`
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

const categoryMasterSlice = createSlice({
  name: "categoryMaster",
  initialState,
  reducers: {
    clearCategoryMasterError(state) {
      state.error = null;
    },
    setSelectedCategoryMaster(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoryMasters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryMasters.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchCategoryMasters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load category master.";
      })
      .addCase(fetchCategoryMaster.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(createCategoryMaster.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateCategoryMaster.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteCategoryMaster.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("categoryMaster/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearCategoryMasterError, setSelectedCategoryMaster } =
  categoryMasterSlice.actions;
export const selectCategoryMasters = (state) => state.categoryMaster.items;
export const selectCategoryMasterLoading = (state) => state.categoryMaster.loading;
export const selectCategoryMasterError = (state) => state.categoryMaster.error;
export const selectSelectedCategoryMaster = (state) => state.categoryMaster.selected;

export default categoryMasterSlice.reducer;

