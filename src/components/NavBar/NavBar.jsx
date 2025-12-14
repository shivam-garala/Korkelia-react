'use client';

import Link from "next/link";
import styles from "./NavBar.module.css";

export default function NavBar({
  items,
  orientation,
  activeHref,
  onNavigate,
  className,
}) {
  const classes = [
    styles.bar,
    styles[orientation],
    className ? className : "",
  ].join(" ");

  return (
    <nav className={classes} data-orientation={orientation}>
      <div className={styles.brandRow}>
        <div className={styles.brandDot} />
        <div>
          <p className={styles.brandLabel}>Navigation</p>
          <p className={styles.brandMode}>
            {orientation === "top"
              ? "Horizontal"
              : orientation === "left"
              ? "Left rail"
              : "Right rail"}
          </p>
        </div>
      </div>

      <ul className={styles.navList}>
        {items.map((item) => {
          const isActive = activeHref === item.href;

          return (
            <li key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ""}`}
                onClick={(event) => {
                  if (onNavigate) {
                    event.preventDefault();
                    onNavigate(item.href);
                  }
                }}
              >
                <span className={styles.bullet} aria-hidden />
                <span className={styles.textGroup}>
                  <span className={styles.label}>{item.label}</span>
                  {item.description ? (
                    <span className={styles.description}>
                      {item.description}
                    </span>
                  ) : null}
                </span>
                {item.badge ? (
                  <span className={styles.badge}>{item.badge}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
