"use client";

import { useId } from "react";
import Select, { components } from "react-select";
import styles from "./FiltersBar.module.css";

function CheckboxOption(props) {
  const { isSelected, label } = props;
  return (
    <components.Option {...props}>
      <div className={styles.optionRow}>
        <input
          className={styles.optionCheckbox}
          type="checkbox"
          checked={isSelected}
          readOnly
          tabIndex={-1}
        />
        <span className={styles.optionLabel}>{label}</span>
      </div>
    </components.Option>
  );
}

export default function FiltersBar({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  leftOptions = [],
  rightOptions = [],
  leftMulti = false,
  leftDisabled = false,
  rightDisabled = false,
}) {
  const leftId = useId();
  const rightId = useId();
  const leftValues = Array.isArray(leftValue)
    ? leftValue
    : leftValue
    ? [leftValue]
    : [];
  const leftSelected = leftMulti
    ? leftOptions.filter((opt) => leftValues.includes(opt.value))
    : leftOptions.find((opt) => opt.value === leftValue) ?? null;
  const rightSelected = rightOptions.find((opt) => opt.value === rightValue) ?? null;

  return (
    <div className={styles.bar}>
      <div className={styles.slot}>
        <Select
          className={styles.select}
          classNamePrefix="filters"
          instanceId={leftId}
          value={leftSelected}
          placeholder={leftLabel}
          options={leftOptions}
          onChange={(option) => {
            if (!leftMulti) {
              onLeftChange?.(option?.value ?? "");
              return;
            }
            const values = Array.isArray(option)
              ? option.map((opt) => opt.value)
              : [];
            onLeftChange?.(values);
          }}
          isMulti={leftMulti}
          closeMenuOnSelect={!leftMulti}
          hideSelectedOptions={false}
          components={leftMulti ? { Option: CheckboxOption } : undefined}
          isSearchable={false}
          isDisabled={leftDisabled}
        />
      </div>
      <div className={styles.slotRight}>
        <Select
          className={styles.select}
          classNamePrefix="filters"
          instanceId={rightId}
          value={rightSelected}
          placeholder={rightLabel}
          options={rightOptions}
          onChange={(option) => onRightChange?.(option?.value ?? "")}
          isSearchable={false}
          isDisabled={rightDisabled}
        />
      </div>
    </div>
  );
}
