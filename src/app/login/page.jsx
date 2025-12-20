'use client';

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearCredentials,
  selectIsAuthenticated,
  selectUserName,
  setCredentials,
} from "../../store/authSlice.js";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import axiosClient from "../../lib/axiosClient.js";
import styles from "./page.module.css";

function EyeIcon({ open, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}> 
      <path
        d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {open ? null : (
        <path
          d="M4 20 20 4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const userName = useAppSelector(selectUserName);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const statusLabel = useMemo(() => {
    if (!isAuthed) return null;
    return `Authenticated as ${userName ?? "user"}`;
  }, [isAuthed, userName]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const response = await axiosClient.post(
        "admin/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = response?.data ?? null;
      const token =
        data?.authToken ??
        data?.token ??
        data?.accessToken ??
        data?.access_token ??
        null;
      const resolvedEmail = data?.email ?? email;
      const resolvedUserName = data?.username ?? data?.userName ?? resolvedEmail;

      if (!token) {
        const errorMessage =
          data?.message ??
          data?.error ??
          (typeof data === "string" ? data : null) ??
          "Login failed. Please check your credentials.";
        setMessage(errorMessage);
        return;
      }

      dispatch(
        setCredentials({
          token,
          userName: resolvedUserName,
          email: resolvedEmail,
        })
      );
      router.push("/admin");
    } catch (error) {
      const data = error?.response?.data ?? null;
      const errorMessage =
        data?.message ??
        data?.error ??
        (typeof data === "string" ? data : null) ??
        "Login failed. Please check your credentials.";
      setMessage(errorMessage);
      console.error("Login error", error);
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosClient.post("admin/logout");
    } catch (error) {
      console.error("Logout error", error);
    }
    dispatch(clearCredentials());
    setMessage("Signed out and cleared cookies.");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.panel}>
          <div className={styles.brand}>
            <Image
              className={styles.logo}
              src="/logo/logo.png"
              alt="Korkeila Helsinki"
              width={190}
              height={62}
              priority
            />
          </div>
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
              <span className={styles.passwordWrap}>
                <input
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  className={styles.eyeButton}
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon className={styles.eyeIcon} open={showPassword} />
                </button>
              </span>
            </label>

            <button className={styles.primary} type="submit" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </button>

            <a
              className={styles.forgot}
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </a>
          </form>

          <div className={styles.meta} aria-live="polite">
            {message ? <p className={styles.message}>{message}</p> : null}
            {statusLabel ? (
              <div className={styles.authedRow}>
                <span className={styles.status}>{statusLabel}</span>
                <button
                  className={styles.signOut}
                  type="button"
                  onClick={handleLogout}
                  disabled={busy}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
