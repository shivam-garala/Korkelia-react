"use client";

import styles from "./Fields.module.css";

export default function SelectField({
  label,
  value,
  onChange,
  required,
  disabled,
  name,
  placeholder = "Select",
  options = [],
  multiple = false,
}) {
  const normalizedValue = multiple ? (Array.isArray(value) ? value : []) : value ?? "";

  return (
    <label className={styles.field}>
      {label ? <span className={styles.label}>{label}</span> : null}
      <select
        className={`${styles.control} ${styles.select}`}
        value={normalizedValue}
        onChange={onChange}
        required={required}
        disabled={disabled}
        name={name}
        multiple={multiple}
      >
        {multiple ? null : (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={String(opt.value)} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
