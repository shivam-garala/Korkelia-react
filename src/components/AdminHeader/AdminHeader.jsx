'use client';

import LanguageDropdown from "../LanguageDropdown/LanguageDropdown.jsx";
import styles from "../../styles/workspace.module.css";

export default function AdminHeader({
  onSearch,
  onProfile,
  avatarText = "U",
  actions = null,
}) {
  return (
    <header className={styles.headerBar}>
      <div className={styles.team} />
      <div className={styles.actionsRow}>
        <button className={styles.chip} onClick={onSearch}>
          🔍 ⌘K
        </button>
        <LanguageDropdown />
        {actions}
        <button
          className={styles.avatarRing}
          onClick={onProfile}
          aria-label="Open profile"
        >
          <span className={styles.avatarRingInner}>{avatarText || "U"}</span>
        </button>
      </div>
    </header>
  );
}
