"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Dropdown from "./Dropdown";
import NavMenuOverlay from "./NavMenuOverlay";
import styles from "./SiteHeader.module.css";
import { useI18n } from "../../providers/I18nProvider.jsx";
import ShareProductModal from "../Product/ShareProductModal.jsx";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, currency, setCurrency, t } = useI18n();
  const languageLabels =
    language === "fi"
      ? { en: "englanti", fi: "suomi" }
      : { en: "English", fi: "Finnish" };

  const topBarContent = (
    <>
      <div className={styles.topLeft}>
        <Dropdown
          ariaLabel={t("common.language")}
          leadingIcon="globe"
          value={language}
          onChange={setLanguage}
          options={[
            {
              value: "en",
              label: languageLabels.en,
              icon: "/icons/uk.svg",
              iconAlt: "United Kingdom flag",
            },
            {
              value: "fi",
              label: languageLabels.fi,
              icon: "/icons/finland.svg",
              iconAlt: "Finland flag",
            },
          ]}
        />
        <Dropdown
          ariaLabel={t("header.currency")}
          leadingIcon="currency"
          value={currency}
          onChange={setCurrency}
          options={[
            {
              value: "eur",
              label: "Euro",
              icon: "/icons/euro.png",
              iconAlt: "Euro symbol",
            },
            {
              value: "usd",
              label: "Dollar",
              icon: "/icons/dollar.png",
              iconAlt: "Dollar symbol",
            },
          ]}
          triggerClassName={styles.currencyTrigger}
        />
      </div>

      <div className={styles.topRight}>
        <ShareProductModal
          buttonClassName={styles.topLink}
          buttonContent={
            <>
              <Image className={styles.topIcon} src="/icons/share.png" alt="" width={14} height={14} />
              <span>{t("header.share")}</span>
            </>
          }
        />
        <Link className={styles.topLink} href="/appointment">
          <Image className={styles.topIcon} src="/icons/appointment.png" alt="" width={14} height={14} />
          <span>{t("header.appointment")}</span>
        </Link>
        <Link className={styles.topLink} href="/contact">
          <Image
            className={styles.topIcon}
            src="/icons/contact_header_icon.png"
            alt=""
            width={14}
            height={14}
          />
          <span>{t("header.ambassador")}</span>
        </Link>
      </div>
    </>
  );

  return (
    <>
      <header className={styles.header}>
        <div>
          <div className={styles.topInner}>
            {topBarContent}
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
              <Image className={styles.icon} src="/icons/menu.png" alt="" width={22} height={22} />
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
