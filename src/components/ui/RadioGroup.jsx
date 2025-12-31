import { useId } from "react";
import fieldStyles from "./Fields.module.css";
import styles from "./RadioGroup.module.css";

export default function RadioGroup({
  label,
  name,
  value,
  options = [],
  onChange,
  required = false,
}) {
  const groupId = useId();
  const labelId = label ? `${groupId}-label` : undefined;

  return (
    <div className={fieldStyles.field}>
      {label ? (
        <span id={labelId} className={fieldStyles.label}>
          {label}
        </span>
      ) : null}
      <div className={styles.group} role="radiogroup" aria-labelledby={labelId}>
        {options.map((option, index) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={[
                styles.option,
                checked ? styles.optionChecked : "",
              ].join(" ")}
            >
              <input
                className={styles.input}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange?.(option.value)}
                required={required && index === 0}
              />
              <span className={styles.indicator} aria-hidden />
              <span className={styles.text}>{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
