'use client';

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import SidebarNav from "../../../components/Sidebar/SidebarNav.jsx";
import LanguageDropdown from "../../../components/LanguageDropdown/LanguageDropdown.jsx";
import ProfileDrawer from "../../../components/ProfileDrawer/ProfileDrawer.jsx";
import SearchOverlay from "../../../components/SearchOverlay/SearchOverlay.jsx";
import layout from "../../../styles/workspace.module.css";
import styles from "./page.module.css";

const categories = ["Rings", "Necklace", "Bracelet", "Earrings", "Pendant"];

const products = [
  { id: "P-1001", name: "Gold Ring Classic", status: "Active" },
  { id: "P-1002", name: "Diamond Pendant", status: "Active" },
  { id: "P-1003", name: "Silver Bracelet", status: "Inactive" },
];

export default function ProductListingPage() {
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

        <main className={layout.content}>
          <h1 className={layout.pageTitle}>Product Listing</h1>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.title}>Products</h2>
                <p className={styles.subtitle}>
                  Demo layout for category + product listing styles.
                </p>
              </div>
            </div>

            <div className={styles.layout}>
              <aside className={styles.categories}>
                <h3 className={styles.categoryHeading}>Categories</h3>
                <ul className={styles.categoryList}>
                  {categories.map((category) => (
                    <li key={category} className={styles.categoryItem}>
                      {category}
                    </li>
                  ))}
                </ul>
              </aside>

              <div className={styles.products}>
                <div className={styles.productTable}>
                  <div className={styles.productHead}>
                    <div>Code</div>
                    <div>Product Name</div>
                    <div style={{ justifySelf: "end" }}>Status</div>
                  </div>

                  {products.map((product) => (
                    <div key={product.id} className={styles.productRow}>
                      <div>{product.id}</div>
                      <Link
                        className={styles.productLink}
                        href={`/dashboard/product/${product.id}`}
                      >
                        {product.name}
                      </Link>
                      <div className={styles.status}>{product.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
