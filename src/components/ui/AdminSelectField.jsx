"use client";

import { useId, useMemo } from "react";
import Select from "react-select";
import fieldStyles from "./Fields.module.css";
import styles from "./AdminSelectField.module.css";

export default function AdminSelectField({
  label,
  value,
  onChange,
  required,
  disabled,
  name,
  placeholder = "Select",
  options = [],
  multiple = false,
  isSearchable = true,
}) {
  const selectId = useId();
  const normalizedValue = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value ?? "";
  const selectedValue = multiple
    ? options.filter((opt) =>
        normalizedValue.some((val) => String(opt.value) === String(val))
      )
    : options.find((opt) => String(opt.value) === String(normalizedValue)) ?? null;
  const portalTarget = typeof window !== "undefined" ? document.body : null;
  const selectStyles = useMemo(
    () => ({
      container: (base) => ({ ...base, width: "100%" }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }),
    []
  );

  const handleChange = (option) => {
    if (!onChange) return;
    if (multiple) {
      const values = Array.isArray(option)
        ? option.map((opt) => String(opt.value))
        : [];
      onChange({ target: { value: values } });
      return;
    }
    const nextValue = option?.value ?? "";
    onChange({ target: { value: String(nextValue) } });
  };

  const hiddenValue = Array.isArray(normalizedValue)
    ? normalizedValue.join(",")
    : String(normalizedValue ?? "");

  return (
    <div className={fieldStyles.field}>
      {label ? (
        <label className={fieldStyles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      {required ? (
        <input
          className={styles.hiddenInput}
          tabIndex={-1}
          autoComplete="off"
          value={hiddenValue}
          onChange={() => {}}
          required
          disabled={disabled}
          aria-hidden
        />
      ) : null}
      <Select
        inputId={selectId}
        className={styles.select}
        classNamePrefix="adminSelect"
        value={selectedValue}
        onChange={handleChange}
        options={options}
        isDisabled={disabled}
        placeholder={placeholder}
        isSearchable={isSearchable}
        name={name}
        isMulti={multiple}
        menuPortalTarget={portalTarget}
        menuPosition={portalTarget ? "fixed" : "absolute"}
        styles={selectStyles}
      />
    </div>
  );
}
