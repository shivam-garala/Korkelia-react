'use client';

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import { protectedRoutes } from "../../../routes/routes.js";
import styles from "../../../styles/workspace.module.css";

const relatedRoutes = protectedRoutes.filter((route) =>
  route.path.startsWith("/dashboard")
);

export default function OrdersPage() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

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
            <h1 className={styles.pageTitle}>Orders</h1>
          </div>
          <p className={styles.subtitle}>
            This child route mirrors the kohira-pos dashboard structure. Add
            your actual feature modules under `/dashboard/*`.
          </p>
          <div className={styles.grid}>
            {relatedRoutes.map((link) => (
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
        onLogout={() => {
          // no auth context here; close only
          setProfileOpen(false);
        }}
      />
    </div>
  );
}

