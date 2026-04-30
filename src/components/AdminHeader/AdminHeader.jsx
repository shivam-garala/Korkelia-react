'use client';

import Image from "next/image";
// import LanguageDropdown from "../LanguageDropdown/LanguageDropdown.jsx";
import Icon from "../ui/Icon.jsx";
import GlobalLoader from "../ui/GlobalLoader.jsx";
import styles from "../../styles/workspace.module.css";

export default function AdminHeader({
  onSearch,
  onProfile,
  avatarText = "U",
  actions = null,
}) {
  const handleMenuClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sidebar:toggle"));
    }
  };

  const displayAvatarText = avatarText || "U";

  return (
    <>
      <header className={styles.headerBar}>
        <div className={styles.team}>
          <button
            className={styles.menuBtn}
            type="button"
            onClick={handleMenuClick}
            aria-label="Toggle sidebar"
          >
            <Icon name="menu" size={18} />
          </button>
          <Image
            className={styles.headerLogo}
            src="/logo/logo.png"
            alt="Korkeila"
            width={140}
            height={70}
            priority
          />
        </div>
        <div className={styles.actionsRow}>
          {onSearch ? (
            <button className={styles.chip} onClick={onSearch}>
              <Icon name="search" size={16} />
              Search
            </button>
          ) : null}
          {/* <LanguageDropdown triggerClassName={styles.adminLanguageDropdown} /> */}
          {actions}
          <button
            className={styles.avatarRing}
            onClick={onProfile}
            aria-label="Open profile"
          >
            <span className={styles.avatarRingInner}>{displayAvatarText}</span>
          </button>
        </div>
      </header>
      <GlobalLoader />
    </>
  );
}
