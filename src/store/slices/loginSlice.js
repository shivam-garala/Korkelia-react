import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const initialState = {
  token: null,
  userName: null,
  email: null,
};

const loginSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromCookie(state, action) {
      const payload = action.payload;
      if (!payload) {
        state.token = null;
        state.userName = null;
        state.email = null;
        return;
      }

      if (typeof payload === "string") {
        state.token = payload;
        return;
      }

      state.token = payload.token ?? null;
      state.userName = payload.userName ?? null;
      state.email = payload.email ?? null;
    },
    setCredentials(state, action) {
      const { token, userName, email } = action.payload;
      state.token = token;
      state.userName = userName ?? null;
      state.email = email ?? null;
      Cookies.set("authToken", token, { sameSite: "lax" });
      if (userName) {
        Cookies.set("userName", userName, { sameSite: "lax" });
      }
      if (email) {
        Cookies.set("email", email, { sameSite: "lax" });
      }
    },
    clearCredentials(state) {
      state.token = null;
      state.userName = null;
      state.email = null;
      Cookies.remove("authToken");
      Cookies.remove("userName");
      Cookies.remove("email");
    },
  },
});

export const { setCredentials, clearCredentials, hydrateFromCookie } = loginSlice.actions;

export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectUserName = (state) => state.auth.userName;
export const selectEmail = (state) => state.auth.email;

export default loginSlice.reducer;
