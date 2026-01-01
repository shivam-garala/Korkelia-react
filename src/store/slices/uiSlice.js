import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  globalLoadingCount: 0,
};

const isPending = (action) => action.type.endsWith("/pending");
const isResolved = (action) =>
  action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected");
const isCreateOrUpdate = (action) =>
  action.type.includes("/create") || action.type.includes("/update");

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    resetGlobalLoading(state) {
      state.globalLoadingCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => isCreateOrUpdate(action) && isPending(action),
        (state) => {
          state.globalLoadingCount += 1;
        }
      )
      .addMatcher(
        (action) => isCreateOrUpdate(action) && isResolved(action),
        (state) => {
          state.globalLoadingCount = Math.max(0, state.globalLoadingCount - 1);
        }
      );
  },
});

export const { resetGlobalLoading } = uiSlice.actions;
export const selectGlobalLoading = (state) => state.ui.globalLoadingCount > 0;

export default uiSlice.reducer;
