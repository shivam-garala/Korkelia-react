"use client";

import styles from "./Fields.module.css";

export default function TextArea({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  rows = 4,
  disabled = false,
  id = undefined,
  name = "",
  style = {},
  inputClassName = "",
  inputStyle = {},
}) {
  return (
    <label className={styles.field} style={style}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <textarea
        className={`${styles.control} ${styles.textarea}${inputClassName ? ` ${inputClassName}` : ""}`}
        style={inputStyle}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        id={id}
        name={name}
      />
    </label>
  );
}
