'use client';

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../components/SearchOverlay/SearchOverlay.jsx";
import { protectedRoutes } from "../../routes/routes.js";
import { clearCredentials, selectUserName } from "../../store/authSlice.js";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import styles from "../../styles/workspace.module.css";

const dashboardLinks = protectedRoutes.filter((route) =>
  route.path.startsWith("/dashboard")
);

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const userName = useAppSelector(selectUserName) ?? "Admin";
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className={styles.page}>
      <SidebarNav activePath={pathname} />

      <div className={styles.main}>
        <header className={styles.headerBar}>
          <div className={styles.team}>
            <div className={styles.badge}>Team 1 · Free</div>
            <span style={{ color: "#9ca3af", fontSize: 14 }}>▼</span>
          </div>
          <div className={styles.actionsRow}>
            <button className={styles.chip} onClick={() => setSearchOpen(true)}>
              🔍 ⌘K
            </button>
            <LanguageDropdown />
            <button className={styles.ghostIcon}>⚙️</button>
            <button className={styles.ghostIcon}>🔔</button>
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
            <h1 className={styles.pageTitle}>Dashboard</h1>
          </div>
          <p className={styles.subtitle}>
            Guarded layout inspired by the reference design. Sidebar is static
            (SSR) and the content area spans the remaining width.
          </p>
          <div className={styles.grid}>
            {dashboardLinks.map((link) => (
              <Link key={link.id} href={link.path} className={styles.tile}>
                <p className={styles.tileLabel}>{link.name}</p>
                <p className={styles.tilePath}>{link.path}</p>
              </Link>
            ))}
          </div>
        </main>
      </div>
      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        name={userName}
        onLogout={() => {
          dispatch(clearCredentials());
          router.push("/login");
        }}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
