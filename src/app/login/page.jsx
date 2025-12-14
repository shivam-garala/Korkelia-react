'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearCredentials,
  selectIsAuthenticated,
  selectUserName,
  setCredentials,
} from "../../store/authSlice.js";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const userName = useAppSelector(selectUserName);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      // Swap this mock with a real login call:
      // const { data } = await axiosClient.post("/auth/login", { email, password });
      // dispatch(setCredentials({ token: data.token, userName: data.name }));

      const token = "demo-token";
      dispatch(setCredentials({ token, userName: email }));
      router.push("/dashboard");
    } catch (error) {
      setMessage("Login failed. Check the console for details.");
      console.error("Login error", error);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    setMessage("Signed out and cleared cookies.");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.kicker}>Login</p>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>
          Enter your email and password to access the dashboard.
        </p>

        <form className={styles.form} onSubmit={handleLogin}>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </label>

          <button className={styles.primary} type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className={styles.actions}>
          <button className={styles.secondary} type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>

        <div className={styles.meta}>
          <p>
            <strong>Status:</strong>{" "}
            {isAuthed
              ? `Authenticated as ${userName ?? "user"}`
              : "Not authenticated"}
          </p>
          {message ? <p className={styles.message}>{message}</p> : null}
        </div>
      </div>
    </div>
  );
}
