"use client";

import { useEffect, useRef } from "react";
import styles from "./Fields.module.css";

export default function TextField({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  autoComplete = undefined,
  inputMode = "",
  step = undefined,
  min = undefined,
  disabled = false,
  id = undefined,
  name = "",
  preventWheel = type === "number",
  style = {},
  inputClassName = "",
  inputStyle = {},
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
    <label className={styles.field} style={style}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <input
        ref={inputRef}
        className={`${styles.control}${inputClassName ? ` ${inputClassName}` : ""}`}
        style={inputStyle}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete || undefined}
        inputMode={inputMode}
        step={step}
        min={min}
        disabled={disabled}
        id={id}
        name={name}
      />
    </label>
  );
}
