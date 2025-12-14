import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  token: null,
  userName: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromCookie(state, action) {
      state.token = action.payload ?? null;
    },
    setCredentials(state, action) {
      const { token, userName } = action.payload;
      state.token = token;
      state.userName = userName ?? null;
      Cookies.set("authToken", token, { sameSite: "lax" });
      if (userName) {
        Cookies.set("userName", userName, { sameSite: "lax" });
      }
    },
    clearCredentials(state) {
      state.token = null;
      state.userName = null;
      Cookies.remove("authToken");
      Cookies.remove("userName");
    },
  },
});

export const { setCredentials, clearCredentials, hydrateFromCookie } =
  authSlice.actions;

export const selectIsAuthenticated = (state) =>
  Boolean(state.auth.token);

export const selectUserName = (state) =>
  state.auth.userName;

export default authSlice.reducer;
