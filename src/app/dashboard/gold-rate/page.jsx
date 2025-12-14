'use client';

import { useState } from "react";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import { usePathname } from "next/navigation";
import styles from "./page.module.css";
import layout from "../../../styles/workspace.module.css";

const mockRows = [
  { date: "09-12-2025", buy: 75000, sell: 79167, pct: 5, karat: "testing" },
  { date: "09-12-2025", buy: 90000, sell: 95000, pct: 5, karat: "24KT" },
  { date: "09-12-2025", buy: 82500, sell: 87083, pct: 5, karat: "22KT" },
  { date: "09-12-2025", buy: 67500, sell: 71250, pct: 5, karat: "18KT" },
  { date: "09-12-2025", buy: 75000, sell: 79167, pct: 5, karat: "20KT" },
  { date: "09-12-2025", buy: 52500, sell: 55417, pct: 5, karat: "14KT" },
  { date: "09-12-2025", buy: 33750, sell: 35625, pct: 5, karat: "9KT" },
  { date: "05-12-2025", buy: 35625, sell: 37500, pct: 3, karat: "9KT" },
  { date: "05-12-2025", buy: 79167, sell: 83333, pct: 3, karat: "testing" },
  { date: "05-12-2025", buy: 71250, sell: 75000, pct: 3, karat: "18KT" },
];

export default function GoldRatePage() {
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
          <h1 className={layout.pageTitle}>Today&apos;s Gold Rate</h1>
          <div className={styles.panel}>
            <div className={styles.formRow}>
              <label className={styles.field}>
                <span>Buying Gold Rate (24KT)*</span>
                <input type="number" placeholder="Enter Buying Gold Rate" />
              </label>
              <label className={styles.field}>
                <span>Selling Gold Rate (24KT)</span>
                <input type="number" placeholder="Enter Selling Rate" />
              </label>
              <label className={styles.field}>
                <span>Percentage*</span>
                <input type="number" placeholder="Enter Percentage" />
              </label>
              <button className={styles.saveBtn}>Save</button>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableHead}>
                <div>Date</div>
                <div>Buying Rate</div>
                <div>Selling Rate</div>
                <div>Percentage</div>
                <div>Karat</div>
              </div>
              <div className={styles.filterRow}>
                <input type="text" placeholder="mm/dd/yyyy" />
                <input type="text" placeholder="Search Buying Rate" />
                <input type="text" placeholder="Search Selling Rate" />
                <input type="text" placeholder="Search Percentage" />
                <input type="text" placeholder="Search Karat" />
              </div>
              <div className={styles.body}>
                {mockRows.map((row, idx) => (
                  <div key={`${row.date}-${idx}`} className={styles.dataRow}>
                    <div>{row.date}</div>
                    <div>{row.buy.toLocaleString()}</div>
                    <div>{row.sell.toLocaleString()}</div>
                    <div>{row.pct}</div>
                    <div>{row.karat}</div>
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
