import styles from "./FiltersBar.module.css";

export default function FiltersBar({ leftLabel, rightLabel, leftValue, rightValue, onLeftChange, onRightChange }) {
  return (
    <div className={styles.bar}>
      <div className={styles.slot}>
        <select className={styles.select} value={leftValue} onChange={(e) => onLeftChange?.(e.target.value)}>
          <option value="all">{leftLabel}</option>
          <option value="all">All</option>
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
        </select>
      </div>
      <div className={styles.slotRight}>
        <select className={styles.select} value={rightValue} onChange={(e) => onRightChange?.(e.target.value)}>
          <option value="all">{rightLabel}</option>
          <option value="rings">Rings</option>
          <option value="bracelets">Bracelets</option>
          <option value="necklaces">Necklaces</option>
          <option value="earrings">Earrings</option>
        </select>
      </div>
    </div>
  );
}

