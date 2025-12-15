'use client';

import { useEffect } from "react";
import { Provider } from "react-redux";
import Cookies from "js-cookie";
import { hydrateFromCookie } from "../store/authSlice.js";
import { store } from "../store/store.js";
import { I18nProvider } from "./I18nProvider.jsx";

export default function StoreProvider({ children }) {
  useEffect(() => {
    // Sync auth state from cookies on the client so middleware + Redux stay aligned.
    const token = Cookies.get("authToken") ?? null;
    const userName = Cookies.get("userName") ?? null;
    store.dispatch(hydrateFromCookie({ token, userName }));
  }, []);

  return (
    <Provider store={store}>
      <I18nProvider>{children}</I18nProvider>
    </Provider>
  );
}
