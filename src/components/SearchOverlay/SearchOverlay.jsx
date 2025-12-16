'use client';

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./SearchOverlay.module.css";

const ITEMS = [
  { label: "App", path: "/dashboard", tag: "Overview" },
  { label: "Ecommerce", path: "/dashboard/ecommerce", tag: "Overview" },
  { label: "Analytics", path: "/dashboard/analytics", tag: "Overview" },
  { label: "Banking", path: "/dashboard/banking", tag: "Overview" },
  { label: "Booking", path: "/dashboard/booking", tag: "Overview" },
  { label: "File", path: "/dashboard/file", tag: "Overview" },
  { label: "Metal Rate", path: "/dashboard/gold-rate", tag: "Rates" },
  { label: "System Users", path: "/dashboard/user", tag: "Users" },
  { label: "User Roles", path: "/dashboard/user-role", tag: "Users" },
];

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const results = useMemo(() => {
    if (!query) return ITEMS;
    const q = query.toLowerCase();
    return ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.path.toLowerCase().includes(q)
    );
  }, [query]);

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
