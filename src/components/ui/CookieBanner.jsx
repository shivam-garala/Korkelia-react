"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useI18n } from "../../providers/I18nProvider.jsx";
import styles from "./CookieBanner.module.css";

const COOKIE_KEY = "cookieConsent";
const COOKIE_DAYS = 365;

export default function CookieBanner() {
  const { language } = useI18n();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const policyHref = "/privacy-policy";

  const labels =
    language === "fi"
      ? {
          title: "Evasteasetukset",
          message:
            "Kaytamme valttamattomia evasteita sivuston toimintaan. Suostumuksellasi kaytamme myos analytiikka- ja markkinointievasteita.",
          acceptAll: "Hyvaksy kaikki",
          decline: "Hylkaa ei-valttamattomat",
          save: "Tallenna asetukset",
          settings: "Asetukset",
          necessaryTitle: "Valttamattomat",
          necessaryNote: "Aina paalla. Tarvitaan sivuston toimintaan.",
          analyticsTitle: "Analytiikka",
          analyticsNote: "Auttaa meita ymmartamaan sivuston kayttoa.",
          marketingTitle: "Markkinointi",
          marketingNote: "Personoitu sisalto ja tarjoukset.",
          policy: "Tietosuojakaytanto",
        }
      : {
          title: "Cookie preferences",
          message:
            "We use necessary cookies to make the site work. With your consent, we also use analytics and marketing cookies.",
          acceptAll: "Accept all",
          decline: "Reject non-essential",
          save: "Save preferences",
          settings: "Preferences",
          necessaryTitle: "Necessary",
          necessaryNote: "Always on. Required for the site to function.",
          analyticsTitle: "Analytics",
          analyticsNote: "Helps us understand how the site is used.",
          marketingTitle: "Marketing",
          marketingNote: "Personalized content and offers.",
          policy: "Privacy Policy",
        };

  useEffect(() => {
    const existing = Cookies.get(COOKIE_KEY);
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const saveConsent = (payload) => {
    Cookies.set(COOKIE_KEY, JSON.stringify(payload), {
      expires: COOKIE_DAYS,
      sameSite: "lax",
      path: "/",
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-modal="true">
      <div className={styles.content}>
        <div className={styles.title}>{labels.title}</div>
        <p className={styles.message}>
          {labels.message}{" "}
          <a className={styles.link} href={policyHref}>
            {labels.policy}
          </a>
        </p>
        {showSettings ? (
          <div className={styles.settings}>
            <div className={styles.settingRow}>
              <div className={styles.settingText}>
                <div className={styles.settingTitle}>{labels.necessaryTitle}</div>
                <div className={styles.settingNote}>{labels.necessaryNote}</div>
              </div>
              <input className={styles.toggle} type="checkbox" checked readOnly disabled />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingText}>
                <div className={styles.settingTitle}>{labels.analyticsTitle}</div>
                <div className={styles.settingNote}>{labels.analyticsNote}</div>
              </div>
              <input
                className={styles.toggle}
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(event) => setAnalyticsEnabled(event.target.checked)}
              />
            </div>
            <div className={styles.settingRow}>
              <div className={styles.settingText}>
                <div className={styles.settingTitle}>{labels.marketingTitle}</div>
                <div className={styles.settingNote}>{labels.marketingNote}</div>
              </div>
              <input
                className={styles.toggle}
                type="checkbox"
                checked={marketingEnabled}
                onChange={(event) => setMarketingEnabled(event.target.checked)}
              />
            </div>
          </div>
        ) : null}
      </div>
      <div className={styles.actions}>
        {showSettings ? (
          <>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() =>
                saveConsent({
                  choice: "rejected",
                  necessary: true,
                  analytics: false,
                  marketing: false,
                })
              }
            >
              {labels.decline}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() =>
                saveConsent({
                  choice: "accepted",
                  necessary: true,
                  analytics: true,
                  marketing: true,
                })
              }
            >
              {labels.acceptAll}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                saveConsent({
                  choice: "custom",
                  necessary: true,
                  analytics: analyticsEnabled,
                  marketing: marketingEnabled,
                })
              }
            >
              {labels.save}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() =>
                saveConsent({
                  choice: "rejected",
                  necessary: true,
                  analytics: false,
                  marketing: false,
                })
              }
            >
              {labels.decline}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                saveConsent({
                  choice: "accepted",
                  necessary: true,
                  analytics: true,
                  marketing: true,
                })
              }
            >
              {labels.acceptAll}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setShowSettings(true)}
            >
              {labels.settings}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
