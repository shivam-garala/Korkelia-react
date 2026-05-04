"use client";

import Image from "next/image";
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
  /** option `value`s to omit from the dropdown (e.g. currencies already in the list). Current selection is always kept. */
  excludeOptionValues = [],
  multiple = false,
  isSearchable = true,
}) {
  const selectId = useId();
  const normalizedValue = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value ?? "";
  const visibleOptions = useMemo(() => {
    if (!Array.isArray(excludeOptionValues) || excludeOptionValues.length === 0) {
      return options;
    }
    const blocked = new Set(
      excludeOptionValues.map((v) => String(v).trim().toUpperCase()).filter(Boolean),
    );
    return options.filter((opt) => {
      const v = String(opt.value ?? "").toUpperCase();
      if (multiple) {
        if (normalizedValue.some((nv) => String(nv).toUpperCase() === v)) return true;
      } else if (String(normalizedValue ?? "").toUpperCase() === v) {
        return true;
      }
      return !blocked.has(v);
    });
  }, [options, excludeOptionValues, multiple, normalizedValue]);
  const selectedValue = multiple
    ? visibleOptions.filter((opt) =>
        normalizedValue.some((val) => String(opt.value) === String(val)),
      )
    : visibleOptions.find((opt) => String(opt.value) === String(normalizedValue)) ?? null;
  const portalTarget = typeof window !== "undefined" ? document.body : null;
  const hasOptionIcons = useMemo(
    () => visibleOptions.some((o) => Boolean(o?.icon)),
    [visibleOptions],
  );
  const formatOptionLabel = useMemo(() => {
    if (!hasOptionIcons) return undefined;
    return (option) => (
      <div className={styles.optionRow}>
        {option.icon ? (
          <Image
            className={styles.optionIcon}
            src={option.icon}
            alt={option.iconAlt ?? ""}
            width={18}
            height={14}
            unoptimized
          />
        ) : null}
        <span>{option.label}</span>
      </div>
    );
  }, [hasOptionIcons]);
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
        options={visibleOptions}
        {...(formatOptionLabel ? { formatOptionLabel } : {})}
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
