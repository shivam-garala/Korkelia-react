'use client';

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./SearchOverlay.module.css";
import { sidebarSections } from "../Sidebar/SidebarNav.jsx";

const DEFAULT_ITEMS = sidebarSections.flatMap((section) =>
  section.items.map((item) => ({
    label: item.label,
    path: item.href,
    tag: section.title,
  }))
);

export default function SearchOverlay({ open, onClose, items = DEFAULT_ITEMS }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (ev) => {
      if (ev.key === "Escape") {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
    }
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Search"
      >
        <div className={styles.inputRow}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.esc}>Esc</span>
        </div>
        <div className={styles.list}>
          {results.map((item) => (
            <Link key={item.path} href={item.path} className={styles.row} onClick={onClose}>
              <div>
                <p className={styles.label}>{item.label}</p>
                <p className={styles.path}>{item.path}</p>
              </div>
              {item.tag ? <span className={styles.tag}>{item.tag}</span> : null}
            </Link>
          ))}
          {results.length === 0 && (
            <div className={styles.empty}>No results found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
