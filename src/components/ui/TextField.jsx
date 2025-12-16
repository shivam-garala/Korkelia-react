"use client";

import { useEffect, useRef } from "react";
import styles from "./Fields.module.css";

export default function TextField({
  label,
  type = "text",
  value,
  onChange,
  required,
  placeholder,
  autoComplete,
  inputMode,
  step,
  disabled,
  name,
  preventWheel = type === "number",
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    const node = inputRef.current;
    if (!node || !preventWheel || type !== "number") return;

    const onWheel = (event) => {
      if (document.activeElement === node) {
        event.preventDefault();
      }
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [preventWheel, type]);

  return (
    <label className={styles.field}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input
        ref={inputRef}
        className={styles.control}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        step={step}
        disabled={disabled}
        name={name}
      />
    </label>
  );
}

