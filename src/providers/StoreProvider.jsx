'use client';

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import Cookies from "js-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { hydrateFromCookie } from "../store/authSlice.js";
import { store } from "../store/store.js";
import { I18nProvider } from "./I18nProvider.jsx";

export default function StoreProvider({ children }) {
  const pathname = usePathname();
  const showToasts = useMemo(() => {
    if (!pathname) return false;
    return (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/product") ||
      pathname === "/login" ||
      pathname === "/appointment"
    );
  }, [pathname]);

  useEffect(() => {
    // Sync auth state from cookies on the client so middleware + Redux stay aligned.
    const token = Cookies.get("authToken") ?? null;
    const userName = Cookies.get("userName") ?? null;
    const email = Cookies.get("email") ?? null;
    store.dispatch(hydrateFromCookie({ token, userName, email }));
  }, []);

  return (
    <Provider store={store}>
      <I18nProvider>
        {children}
        {showToasts ? <ToastContainer position="top-right" autoClose={3000} /> : null}
      </I18nProvider>
    </Provider>
  );
}
