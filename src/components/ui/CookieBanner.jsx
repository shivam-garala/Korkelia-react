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
  const [preferencesEnabled, setPreferencesEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(false);
  const cookiePolicyHref = "/cookie-policy";
  const policyHref = "/privacy-policy";

  const labels =
    language === "fi"
      ? {
          title: "Evasteasetukset",
          messageIntro:
            "Kaytamme vain valttamattomia evasteita sivuston toimintaan ja evasteasetustesi tallentamiseen.",
          messageNoAnalytics:
            "Emme kayta analytiikka- tai markkinointievaisteita tassa vaiheessa.",
          messageManage: "Voit hallita valintojasi milloin tahansa kohdassa",
          cookiePreferences: "Evasteasetukset",
          messageReadMore: "Lue lisaa",
          cookiePolicy: "Evästekäytäntö",
          and: "ja",
          privacyPolicy: "Tietosuojakaytanto",
          acceptAll: "Hyvaksy kaikki",
          decline: "Hylkaa ei-valttamattomat",
          save: "Tallenna asetukset",
          settings: "Asetukset",
          necessaryTitle: "Valttamattomat",
          necessaryNote: "Aina paalla. Tarvitaan sivuston toimintaan.",
          preferencesTitle: "Toiminnalliset",
          preferencesNote: "Muistaa valinnat, kuten kieli ja ulkoasu.",
          analyticsTitle: "Analytiikka",
          analyticsNote: "Auttaa meita ymmartamaan sivuston kayttoa.",
          marketingTitle: "Markkinointi",
          marketingNote: "Personoitu sisalto ja tarjoukset.",
        }
      : {
          title: "Cookie preferences",
          messageIntro:
            "We use strictly necessary cookies to make the site work and to store your cookie preferences.",
          messageNoAnalytics:
            "We do not use analytics or marketing cookies at this stage.",
          messageManage: "You can manage your choices at any time in",
          cookiePreferences: "Cookie Preferences",
          messageReadMore: "Read more in our",
          cookiePolicy: "Cookie Policy",
          and: "and",
          privacyPolicy: "Privacy Policy",
          acceptAll: "Accept all",
          decline: "Reject non-essential",
          save: "Save preferences",
          settings: "Preferences",
          necessaryTitle: "Necessary",
          necessaryNote: "Always on. Required for the site to function.",
          preferencesTitle: "Preferences",
          preferencesNote: "Remembers your choices like language and layout.",
          analyticsTitle: "Analytics",
          analyticsNote: "Helps us understand how the site is used.",
          marketingTitle: "Marketing",
          marketingNote: "Personalized content and offers.",
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

  const applyConsent = (payload) => {
    if (!payload.preferences) {
      Cookies.remove("siteLang", { path: "/" });
    }
    saveConsent(payload);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-modal="true">
      <div className={styles.content}>
        <div className={styles.title}>{labels.title}</div>
        <p className={styles.message}>
          {labels.messageIntro} {labels.messageNoAnalytics} {labels.messageManage}{" "}
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => setShowSettings(true)}
          >
            {labels.cookiePreferences}
          </button>
          . {labels.messageReadMore}{" "}
          <a className={styles.link} href={cookiePolicyHref}>
            {labels.cookiePolicy}
          </a>{" "}
          {labels.and}{" "}
          <a className={styles.link} href={policyHref}>
            {labels.privacyPolicy}
          </a>
          .
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
                <div className={styles.settingTitle}>{labels.preferencesTitle}</div>
                <div className={styles.settingNote}>{labels.preferencesNote}</div>
              </div>
              <input
                className={styles.toggle}
                type="checkbox"
                checked={preferencesEnabled}
                onChange={(event) => setPreferencesEnabled(event.target.checked)}
              />
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
                applyConsent({
                  choice: "rejected",
                  necessary: true,
                  preferences: false,
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
                applyConsent({
                  choice: "accepted",
                  necessary: true,
                  preferences: true,
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
                applyConsent({
                  choice: "custom",
                  necessary: true,
                  preferences: preferencesEnabled,
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
                applyConsent({
                  choice: "rejected",
                  necessary: true,
                  preferences: false,
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
                applyConsent({
                  choice: "accepted",
                  necessary: true,
                  preferences: true,
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
