"use client";
//edit
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Dropdown from "./Dropdown";
import NavMenuOverlay from "./NavMenuOverlay";
import styles from "./SiteHeader.module.css";
import { useI18n } from "../../providers/I18nProvider.jsx";
import { useEffectiveTranslation } from "../../hooks/useEffectiveLanguage.js";
import ShareProductModal from "../Product/ShareProductModal.jsx";
import axiosClient from "../../lib/axiosClient.js";
import {
  optionEuroForPublicDropdown,
  optionFromPublicRateRow,
} from "../../constants/currencyOptions.js";

/**
 * @param {{ availableLanguages?: Array<"en" | "fi">, fixedLanguage?: "en" | "fi" }} [props]
 */
export default function SiteHeader({
  availableLanguages = ["en", "fi"],
  fixedLanguage,
} = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, currency, setCurrency } = useI18n();
  const { t } = useEffectiveTranslation(fixedLanguage);
  const [publicRates, setPublicRates] = useState([]);
  const pathname = usePathname();
  const router = useRouter();

  // On locale-prefixed URLs (/en/about, /fi/about), the page's language is
  // determined by the URL itself, not the cookie — so switching language here
  // must navigate to the sibling URL instead of just updating client state,
  // otherwise the URL and page content go out of sync with the dropdown.
  // Single-language pages (e.g. a Finnish-only collection) pass fixedLanguage
  // instead, which always wins over the URL/cookie.
  const localeUrlMatch = pathname?.match(/^\/(en|fi)(\/.*)?$/);
  const urlLocale = localeUrlMatch?.[1];
  const effectiveLanguage = fixedLanguage ?? urlLocale ?? language;

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    if (localeUrlMatch) {
      const rest = localeUrlMatch[2] ?? "";
      router.push(`/${nextLanguage}${rest}`);
    }
  };

  useEffect(() => {
    let cancelled = false;
    axiosClient
      .get("/api/currencyRate/public-visible")
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data?.data) ? data.data : [];
        setPublicRates(list);
      })
      .catch(() => {
        if (!cancelled) setPublicRates([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Admin-visible rates; always include EUR in dropdown without forcing EUR selection. */
  const currencyDropdownOptions = useMemo(() => {
    const mapped = publicRates.map(optionFromPublicRateRow).filter(Boolean);
    if (mapped.length === 0) {
      return [optionEuroForPublicDropdown()];
    }
    const hasEur = mapped.some(
      (o) => String(o?.value ?? "").trim().toLowerCase() === "eur",
    );
    if (!hasEur) {
      return [optionEuroForPublicDropdown(), ...mapped];
    }
    return mapped;
  }, [publicRates]);

  const languageLabels =
    effectiveLanguage === "fi"
      ? { en: "Englanti", fi: "Suomi" }
      : { en: "English", fi: "Finnish" };

  const languageOptions = useMemo(
    () =>
      [
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
      ].filter((option) => availableLanguages.includes(option.value)),
    [availableLanguages, languageLabels.en, languageLabels.fi]
  );

  const topBarContent = (
    <>
      <div className={styles.topLeft}>
        <Dropdown
          ariaLabel={t("common.language")}
          leadingIcon="globe"
          value={effectiveLanguage}
          onChange={handleLanguageChange}
          options={languageOptions}
        />
        <div className={styles.currencyRow}>
          <Dropdown
            ariaLabel={t("header.currency")}
            leadingIcon="currency"
            value={currency}
            onChange={setCurrency}
            options={currencyDropdownOptions}
            triggerClassName={styles.currencyTrigger}
          />
        </div>
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
        <Link className={styles.topLink} href={`/${effectiveLanguage}/appointment`}>
          <Image className={styles.topIcon} src="/icons/appointment.png" alt="" width={14} height={14} />
          <span>{t("header.appointment")}</span>
        </Link>
        <Link className={styles.topLink} href={`/${effectiveLanguage}/contact`}>
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

      <NavMenuOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        fixedLanguage={fixedLanguage}
      />
    </>
  );
}
