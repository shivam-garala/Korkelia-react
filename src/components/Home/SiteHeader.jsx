"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Dropdown from "./Dropdown";
import NavMenuOverlay from "./NavMenuOverlay";
import styles from "./SiteHeader.module.css";
import { useI18n } from "../../providers/I18nProvider.jsx";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currency, setCurrency] = useState("eur");
  const { language, setLanguage, t } = useI18n();

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.topInner}>
            <div className={styles.topLeft}>
              <Dropdown
	                ariaLabel={t("common.language")}
                leadingIcon="globe"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "en", label: "English" },
	                  { value: "fi", label: "Finish" },
                ]}
              />
              <Dropdown
	                ariaLabel={t("common.currency")}
                leadingIcon="currency"
                value={currency}
                onChange={setCurrency}
                options={[
                  { value: "eur", label: "EURO" },
                  // { value: "usd", label: "$ USD" },
                ]}
              />
            </div>

            <div className={styles.topRight}>
              <Link className={styles.topLink} href="#">
                <Image className={styles.topIcon} src="/icons/share.png" alt="" width={14} height={14} />
                SHARE
              </Link>
              <Link className={styles.topLink} href="#">
                <Image className={styles.topIcon} src="/icons/appointment.png" alt="" width={14} height={14} />
                BOOK AN APPOINTMENT
              </Link>
              <Link className={styles.topLink} href="#">
                <Image
                  className={styles.topIcon}
                  src="/icons/contact_header_icon.png"
                  alt=""
                  width={14}
                  height={14}
                />
                CONTACT AN AMBASSADOR
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.mainInner}>
          <div className={styles.left}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Image className={styles.icon} src="/icons/menu.png" alt="" width={18} height={18} />
            </button>
            <button type="button" className={styles.iconBtn} aria-label="Search">
              <Image className={styles.icon} src="/icons/search.png" alt="" width={18} height={18} />
            </button>
          </div>

          <Link className={styles.brand} href="/" aria-label="Home">
            <Image
              className={styles.brandLogo}
              src="/logo/logo.png"
              alt="KORKEILA HELSINKI"
              width={520}
              height={270}
              priority
            />
          </Link>

          <div className={styles.right} />
        </div>
      </header>

      <NavMenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
