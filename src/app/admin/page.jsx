'use client';

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SidebarNav from "../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../components/LanguageDropdown/LanguageDropdown.jsx";
import NotificationDrawer from "../../components/NotificationDrawer/NotificationDrawer.jsx";
import ProfileDrawer from "../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../components/SearchOverlay/SearchOverlay.jsx";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { clearCredentials, selectUserName } from "../../store/authSlice.js";
import styles from "../../styles/workspace.module.css";

export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const userName = useAppSelector(selectUserName) ?? "Admin";
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className={styles.page}>
      <SidebarNav activePath={pathname} />

      <div className={styles.main}>
        <header className={styles.headerBar}>
          <div className={styles.team}>
            {/* <div className={styles.badge}>Team 1 · Free</div>
            <span style={{ color: "#9ca3af", fontSize: 14 }}>▼</span> */}
          </div>
          <div className={styles.actionsRow}>
            <button className={styles.chip} onClick={() => setSearchOpen(true)}>
              🔍 ⌘K
            </button>
            <LanguageDropdown />
            <div style={{ position: "relative" }}>
              <button className={styles.ghostIcon} onClick={() => setNotifOpen(true)} aria-label="Open notifications">
                🔔
              </button>
              <span className={styles.dot} />
            </div>
            <button className={styles.ghostIcon}>⚙️</button>
            <button
              className={styles.avatarRing}
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
            >
              <span className={styles.avatarRingInner}>JF</span>
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Blank</h1>
          </div>
          <p className={styles.subtitle}>
            This is a protected admin page using a static sidebar (SSR) and a
            clean top bar, aligned to the provided design.
          </p>
          <div className={styles.card} />
        </main>
      </div>
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        name={userName}
        onLogout={async () => {
          try {
            await fetch("/api/admin/logout", { method: "POST" });
          } catch (error) {
            console.error("Logout error", error);
          }
          dispatch(clearCredentials());
          router.push("/login");
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
