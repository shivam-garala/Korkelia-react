'use client';

import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import SidebarNav from "../../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../../components/SearchOverlay/SearchOverlay.jsx";
import layout from "../../../../styles/workspace.module.css";
import styles from "./page.module.css";

const sampleImages = [
  { name: "Front View", info: "800 x 800" },
  { name: "Side View", info: "800 x 800" },
  { name: "Detail Shot", info: "800 x 800" },
];

export default function ProductDetailsPage() {
  const pathname = usePathname();
  const params = useParams();
  const rawId = params?.id;
  const id =
    typeof rawId === "string"
      ? rawId
      : Array.isArray(rawId)
      ? rawId[0]
      : "Product";
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
              Search
            </button>
            <LanguageDropdown />
            <button className={layout.ghostIcon}>ƒsT‹,?</button>
            <button className={layout.ghostIcon}>...</button>
            <button
              className={layout.avatarRing}
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
            >
              <span className={layout.avatarRingInner}>JF</span>
            </button>
          </div>
        </header>

        <main className={`${layout.content} ${styles.page}`}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Product Details</h1>
              <p className={styles.code}>Code: {id}</p>
            </div>
          </div>

          <div className={styles.content}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Description</h2>
              <div className={styles.panelBody}>
                Heading + body content on this screen uses Nata Sans (via the
                `--font-nata-sans` variable). Update the content and fields to
                match your real product model.
              </div>
            </section>

            <aside className={styles.panel}>
              <h2 className={styles.panelTitle}>Images</h2>
              <div className={styles.imageList}>
                {sampleImages.map((image) => (
                  <div key={image.name} className={styles.imageItem}>
                    <div className={styles.thumb} aria-hidden />
                    <div className={styles.imageMeta}>
                      <p className={styles.imageName}>{image.name}</p>
                      <p className={styles.imageInfo}>{image.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
