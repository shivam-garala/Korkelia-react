'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../components/ProfileDrawer/ProfileDrawer.jsx";
import { protectedRoutes } from "../../routes/routes.js";
import { clearCredentials, selectUserName, selectEmail } from "../../store/authSlice.js";
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
  const userEmail = useAppSelector(selectEmail) ?? "";
  const avatarInitials = useMemo(() => {
    const normalizedName = (userName ?? "").trim();
    if (normalizedName.length) {
      return normalizedName
        .split(" ")
        .map((part) => part.trim()?.[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    const normalizedEmail = (userEmail ?? "").trim();
    if (normalizedEmail.length) {
      const firstChar = normalizedEmail[0];
      const domainChar = normalizedEmail.split("@")[1]?.[0];
      return [firstChar, domainChar].filter(Boolean).join("").slice(0, 2).toUpperCase() || "U";
    }
    return "U";
  }, [userEmail, userName]);
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
            {/* <button className={styles.ghostIcon}>⚙️</button> */}
            {/* <button className={styles.ghostIcon}>🔔</button> */}
            <button
              className={styles.avatarRing}
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
            >
              <span className={styles.avatarRingInner}>{avatarInitials}</span>
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
        email={userEmail}
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
    </div>
  );
}

