'use client';

import { useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import layout from "../../../styles/workspace.module.css";
import styles from "./page.module.css";

const users = [
  { id: 1, name: "mayur", role: "Super Admin", status: "Active" },
  { id: 2, name: "VISHALOPPOSITEUAT", role: "Super Admin", status: "Active" },
  { id: 3, name: "Meet", role: "Super Admin", status: "Active" },
  { id: 4, name: "Hiren", role: "Super Admin", status: "Active" },
  { id: 5, name: "User1", role: "Super Admin", status: "Active" },
  { id: 6, name: "User2", role: "Super Admin", status: "Active" },
  { id: 7, name: "User3", role: "Super Admin", status: "Active" },
  { id: 8, name: "User4", role: "Super Admin", status: "Active" },
  { id: 9, name: "User5", role: "Super Admin", status: "Active" },
  { id: 10, name: "Hetal", role: "Super Admin", status: "Inactive" },
];

export default function UserPage() {
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
          <h1 className={layout.pageTitle}>System Users</h1>
          <div className={styles.panel}>
            <div className={styles.headerRow}>
              <h2 className={styles.title}>System Users</h2>
              <button className={styles.cta}>Create User</button>
            </div>
            <div className={styles.tableCard}>
              <div className={styles.tableHead}>
                <div>No.</div>
                <div>User Name</div>
                <div>Role</div>
                <div>Status</div>
                <div>Action</div>
              </div>
              <div className={styles.filterRow}>
                <input type="text" placeholder="Search No." />
                <input type="text" placeholder="Search User Name" />
                <input type="text" placeholder="Search Role" />
                <input type="text" placeholder="Search Status" />
                <div />
              </div>
              <div className={styles.body}>
                {users.map((user) => (
                  <div key={user.id} className={styles.dataRow}>
                    <div>{user.id}</div>
                    <div>{user.name}</div>
                    <div>{user.role}</div>
                    <div>
                      <span
                        className={`${styles.status} ${
                          user.status === "Active"
                            ? styles.statusActive
                            : styles.statusInactive
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.iconBtn}>👁</button>
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
