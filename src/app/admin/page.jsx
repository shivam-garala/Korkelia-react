'use client';

import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import SidebarNav from "../../components/Sidebar/SidebarNav.jsx";
import AdminHeader from "../../components/AdminHeader/AdminHeader.jsx";
import NotificationDrawer from "../../components/NotificationDrawer/NotificationDrawer.jsx";
import ProfileDrawer from "../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../components/SearchOverlay/SearchOverlay.jsx";
import { useAppDispatch, useAppSelector } from "../../store/hooks.js";
import { clearCredentials, selectEmail, selectUserName } from "../../store/authSlice.js";
import styles from "../../styles/workspace.module.css";

export default function AdminPage() {
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

