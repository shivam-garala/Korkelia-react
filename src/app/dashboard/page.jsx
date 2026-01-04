'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SidebarNav from "../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../components/AdminHeader/AdminHeader.jsx";
import NotificationDrawer from "../../components/NotificationDrawer/NotificationDrawer.jsx";
import ProfileDrawer from "../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../components/SearchOverlay/SearchOverlay.jsx";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { clearCredentials, selectEmail, selectUserName } from "../../store/authSlice.js";
import styles from "../../styles/workspace.module.css";
import pageStyles from "./page.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const userName = useAppSelector(selectUserName) ?? "Admin";
  const userEmail = useAppSelector(selectEmail) ?? "";
  const [hydrated, setHydrated] = useState(false);
  const safeUserName = hydrated ? userName : "Admin";
  const safeUserEmail = hydrated ? userEmail : "";
  const avatarInitials = useMemo(() => {
    const normalizedName = (safeUserName ?? "").trim();
    if (normalizedName.length) {
      return normalizedName
        .split(" ")
        .map((part) => part.trim()?.[0])
        .filter(Boolean)
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    const normalizedEmail = (safeUserEmail ?? "").trim();
    if (normalizedEmail.length) {
      const firstChar = normalizedEmail[0];
      const domainChar = normalizedEmail.split("@")[1]?.[0];
      return [firstChar, domainChar].filter(Boolean).join("").slice(0, 2).toUpperCase() || "U";
    }
    return "U";
  }, [safeUserEmail, safeUserName]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const displayName = useMemo(
    () => safeUserName?.split(" ")[0] || "Admin",
    [safeUserName]
  );

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <div className={styles.page}>
      <SidebarNav activePath={pathname} />

      <div className={styles.main}>
        <AdminHeader
          onSearch={() => setSearchOpen(true)}
          onProfile={() => setProfileOpen(true)}
          avatarText={avatarInitials}
        />

        <main className={styles.content}>
          <div className={pageStyles.simpleWrap}>
            <div className={pageStyles.centerBlock}>
              <p className={pageStyles.eyebrow}>Admin Workspace</p>
              <h1 className={pageStyles.title}>Dashboard</h1>
              <p className={pageStyles.subtitle}>Welcome back, {displayName}.</p>
            </div>
            <div className={pageStyles.footerLogo} aria-hidden>
              <img className={pageStyles.logoImage} src="/logo/footer_logo.png" alt="" />
            </div>
          </div>
        </main>
      </div>
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
      <ProfileDrawer
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        name={safeUserName}
        email={safeUserEmail}
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
