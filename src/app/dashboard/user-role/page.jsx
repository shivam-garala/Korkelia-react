'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import layout from "../../../styles/workspace.module.css";
import styles from "./page.module.css";

const roles = [
  { id: 1, name: "Super Admin" },
  { id: 2, name: "Admin" },
  { id: 3, name: "User" },
];

export default function UserRolePage() {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className={layout.page}>
      <SidebarNav activePath={pathname} />
      <div className={layout.main}>
        <header className={layout.headerBar}>
          <div className={layout.team} />
          <div className={layout.actionsRow}>
            <button className={layout.chip} onClick={() => setSearchOpen(true)}>
              🔍 ⌘K
            </button>
            <LanguageDropdown />
            <button className={layout.ghostIcon}>⚙️</button>
            <button className={layout.ghostIcon}>🔔</button>
            <button
              className={layout.avatarRing}
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
            >
              <span className={layout.avatarRingInner}>JF</span>
            </button>
          </div>
        </header>

        <main className={layout.content}>
          <h1 className={layout.pageTitle}>User Roles</h1>
          <div className={styles.panel}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>User Roles</h2>
              <button className={styles.cta}>Create User Role</button>
            </div>
            <div className={styles.searchBar}>
              <input type="text" placeholder="Search" />
            </div>
            <div className={styles.tableCard}>
              <div className={styles.tableHead}>
                <div>No.</div>
                <div>User Name</div>
                <div>Action</div>
              </div>
              <div className={styles.body}>
                {roles.map((role) => (
                  <div key={role.id} className={styles.dataRow}>
                    <div>{role.id}</div>
                    <div>{role.name}</div>
                    <div className={styles.actions}>
                      <button className={styles.iconBtn}>✏️</button>
                      <button className={styles.iconBtn}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
