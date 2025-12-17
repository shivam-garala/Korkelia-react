'use client';

import styles from "./ProfileDrawer.module.css";

const navItems = [
  { label: "Home" },
  { label: "Profile" },
  { label: "Projects", badge: "3" },
  { label: "Subscription" },
  { label: "Security" },
  { label: "Account settings" },
];

export default function ProfileDrawer({
  open,
  onClose,
  name = "User",
  email = "",
  onLogout,
}) {
  const displayName = name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part.trim()?.[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`${styles.overlay} ${open ? styles.open : ""}`}>
      <aside className={styles.drawer} role="dialog" aria-label="Profile">
        <header className={styles.header}>
          <button className={styles.close} onClick={onClose} aria-label="Close profile">
            ✕
          </button>
        </header>

        <div className={styles.profile}>
          <div className={styles.avatarLg}>{initials || "U"}</div>
          <div className={styles.person}>
            <p className={styles.name}>{displayName}</p>
            {email ? <p className={styles.email}>{email}</p> : null}
          </div>
        </div>

        {/* <nav className={styles.nav}>
          {navItems.map((item) => (
            <button key={item.label} className={styles.navItem} type="button">
              <span>{item.label}</span>
              {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
            </button>
          ))}
        </nav> */}
        <footer className={styles.footer}>
          <button
            className={styles.logout}
            type="button"
            onClick={() => {
              onLogout?.();
              onClose();
            }}
          >
            Logout
          </button>
        </footer>
      </aside>
    </div>
  );
}
