"use client";

import { useAppSelector } from "../../store/hooks.js";
import { selectGlobalLoading } from "../../store/slices/uiSlice.js";
import styles from "./GlobalLoader.module.css";

export default function GlobalLoader() {
  const isLoading = useAppSelector(selectGlobalLoading);

  if (!isLoading) return null;

  return (
    <div className={styles.loaderMain} role="status" aria-live="polite">
      <div className={styles.customLoader} aria-hidden="true" />
    </div>
  );
}
