"use client";

import { useId } from "react";
import Select from "react-select";
import styles from "./FiltersBar.module.css";

export default function FiltersBar({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  leftOptions = [],
  rightOptions = [],
}) {
  const leftId = useId();
  const rightId = useId();
  const leftSelected = leftOptions.find((opt) => opt.value === leftValue) ?? null;
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
          onChange={(option) => onLeftChange?.(option?.value ?? "")}
          isSearchable={false}
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
        />
      </div>
    </div>
  );
}
