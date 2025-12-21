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

export const fetchSubCategories = createAsyncThunk(
  "subCategory/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/subCategory/read");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchSubCategory = createAsyncThunk(
  "subCategory/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/api/subCategory/readOne/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchSubCategoriesByCategory = createAsyncThunk(
  "subCategory/fetchByCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(
        `/api/subCategory/readByCategory/${encodeURIComponent(categoryId)}`
      );
      return { categoryId, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createSubCategory = createAsyncThunk(
  "subCategory/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/subCategory/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateSubCategory = createAsyncThunk(
  "subCategory/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/subCategory/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteSubCategory = createAsyncThunk(
  "subCategory/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(
        `/api/subCategory/delete/${encodeURIComponent(id)}`
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

const subCategorySlice = createSlice({
  name: "subCategory",
  initialState,
  reducers: {
    clearSubCategoryError(state) {
      state.error = null;
    },
    setSelectedSubCategory(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load sub categories.";
      })
      .addCase(fetchSubCategory.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(fetchSubCategoriesByCategory.fulfilled, (state, action) => {
        const items = Array.isArray(action.payload?.data)
          ? action.payload.data
          : action.payload?.data?.data ?? [];
        state.items = items;
      })
      .addCase(createSubCategory.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) => action.type.startsWith("subCategory/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearSubCategoryError, setSelectedSubCategory } = subCategorySlice.actions;
export const selectSubCategories = (state) => state.subCategory.items;
export const selectSubCategoryLoading = (state) => state.subCategory.loading;
export const selectSubCategoryError = (state) => state.subCategory.error;
export const selectSelectedSubCategory = (state) => state.subCategory.selected;

export default subCategorySlice.reducer;
