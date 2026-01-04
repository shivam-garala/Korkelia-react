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

function mergeUniqueById(existing = [], incoming = []) {
  const seen = new Set(existing.map((item) => item?.id));
  const merged = [...existing];
  incoming.forEach((item) => {
    const id = item?.id;
    if (id === undefined || id === null || !seen.has(id)) {
      if (id !== undefined && id !== null) {
        seen.add(id);
      }
      merged.push(item);
    }
  });
  return merged;
}

export const fetchDesignVariants = createAsyncThunk(
  "designVariant/fetchAll",
  async ({ page = 1, limit = 20, search } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      const normalizedSearch =
        typeof search === "string" ? search.trim() : search != null ? String(search) : "";
      if (normalizedSearch) params.search = normalizedSearch;
      const { data } = await axiosClient.get("/api/design/read", {
        params,
      });
      if (Array.isArray(data)) {
        return {
          data,
          total_count: data.length,
          total_pages: 1,
          current_page: page,
          limit,
        };
      }
      return {
        ...data,
        current_page: data?.current_page ?? page,
        limit: data?.limit ?? limit,
      };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchDesignVariant = createAsyncThunk(
  "designVariant/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(`/api/design/readOne/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const createDesignVariant = createAsyncThunk(
  "designVariant/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post("/api/design/create", payload ?? {});
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const updateDesignVariant = createAsyncThunk(
  "designVariant/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(
        `/api/design/update/${encodeURIComponent(id)}`,
        payload ?? {}
      );
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const deleteDesignVariant = createAsyncThunk(
  "designVariant/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.delete(`/api/design/delete/${encodeURIComponent(id)}`);
      return { id, data };
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchProductDropdown = createAsyncThunk(
  "designVariant/fetchProductDropdown",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/product/dropdown");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchMetalRateDropdown = createAsyncThunk(
  "designVariant/fetchMetalRateDropdown",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/metalRateMaster/dropdown");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchCategoryDropdown = createAsyncThunk(
  "designVariant/fetchCategoryDropdown",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/categoryMaster/dropdown");
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

export const fetchRelatedVariantImages = createAsyncThunk(
  "designVariant/fetchRelatedVariantImages",
  async ({ productId, metalRateId }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/api/design/related-variant-images", {
        params: {
          product_id: productId,
          metal_rate_id: metalRateId,
        },
      });
      return data;
    } catch (error) {
      return rejectWithValue(axiosErrorMessage(error, normalizeError(error)));
    }
  }
);

const initialState = {
  items: [],
  selected: null,
  products: [],
  metalRates: [],
  categories: [],
  loading: false,
  loadingMore: false,
  error: null,
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
};

const designVariantSlice = createSlice({
  name: "designVariant",
  initialState,
  reducers: {
    clearDesignVariantError(state) {
      state.error = null;
    },
    setSelectedDesignVariant(state, action) {
      state.selected = action.payload ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesignVariants.pending, (state, action) => {
        const page = action.meta?.arg?.page ?? 1;
        if (page > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
          state.error = null;
        }
      })
      .addCase(fetchDesignVariants.fulfilled, (state, action) => {
        const payload = action.payload ?? {};
        const isArrayPayload = Array.isArray(payload);
        const items = isArrayPayload ? payload : payload?.data ?? [];
        const page =
          (isArrayPayload ? null : payload?.current_page ?? payload?.page) ??
          action.meta?.arg?.page ??
          1;
        const limit = (isArrayPayload ? null : payload?.limit) ?? action.meta?.arg?.limit ?? 10;
        const totalCount =
          (isArrayPayload ? items.length : payload?.total_count ?? payload?.totalCount) ?? 0;
        const totalPages =
          (isArrayPayload ? 1 : payload?.total_pages ?? payload?.totalPages) ||
          (totalCount && limit ? Math.ceil(totalCount / limit) : page);
        state.loading = false;
        state.loadingMore = false;
        state.items = page > 1 ? mergeUniqueById(state.items, items) : items;
        state.totalCount = totalCount;
        state.totalPages = totalPages || 1;
        state.currentPage = page;
        state.limit = limit;
      })
      .addCase(fetchDesignVariants.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload ?? "Failed to load design variants.";
      })
      .addCase(fetchDesignVariant.fulfilled, (state, action) => {
        state.selected = action.payload?.data ?? null;
      })
      .addCase(fetchProductDropdown.fulfilled, (state, action) => {
        state.products = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchMetalRateDropdown.fulfilled, (state, action) => {
        state.metalRates = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(fetchCategoryDropdown.fulfilled, (state, action) => {
        state.categories = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data ?? [];
      })
      .addCase(createDesignVariant.fulfilled, (state, action) => {
        const created = action.payload?.data ?? action.payload;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(updateDesignVariant.fulfilled, (state, action) => {
        const updated = action.payload?.data?.data ?? action.payload?.data;
        if (!updated) return;
        const index = state.items.findIndex((item) => String(item?.id) === String(action.payload.id));
        if (index >= 0) state.items[index] = updated;
      })
      .addCase(deleteDesignVariant.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => String(item?.id) !== String(action.payload.id));
      })
      .addMatcher(
        (action) =>
          action.type.startsWith("designVariant/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.loadingMore = false;
          state.error = action.payload ?? "Request failed.";
        }
      );
  },
});

export const { clearDesignVariantError, setSelectedDesignVariant } = designVariantSlice.actions;
export const selectDesignVariants = (state) => state.designVariant.items;
export const selectDesignVariantLoading = (state) => state.designVariant.loading;
export const selectDesignVariantLoadingMore = (state) => state.designVariant.loadingMore;
export const selectDesignVariantError = (state) => state.designVariant.error;
export const selectDesignVariantProducts = (state) => state.designVariant.products;
export const selectDesignVariantMetalRates = (state) => state.designVariant.metalRates;
export const selectDesignVariantCategories = (state) => state.designVariant.categories;
export const selectDesignVariantPagination = (state) => ({
  totalCount: state.designVariant.totalCount,
  totalPages: state.designVariant.totalPages,
  currentPage: state.designVariant.currentPage,
  limit: state.designVariant.limit,
});

export default designVariantSlice.reducer;
