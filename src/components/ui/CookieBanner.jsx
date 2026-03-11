"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useI18n } from "../../providers/I18nProvider.jsx";
import {
  applyConsent,
  DEFAULT_CONSENT_STATE,
  getConsentSnapshot,
  makeAcceptAllPayload,
  makePayload,
  makeRejectPayload,
  subscribeConsent,
} from "../../lib/cookieConsent.js";
import styles from "./CookieBanner.module.css";

// Keep the server snapshot stable to prevent useSyncExternalStore from looping
// when React re-renders on the server.
const SERVER_CONSENT_SNAPSHOT = { exists: false, state: { ...DEFAULT_CONSENT_STATE } };
const getServerConsent = () => SERVER_CONSENT_SNAPSHOT;

export default function CookieBanner() {
  const { language } = useI18n();

  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsent);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  // Lock page scrolling while the cookie banner is shown
  useEffect(() => {
    if (!ready || consent.exists) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [ready, consent.exists]);

  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState(null);
  const currentSelection = draft ?? consent.state;
  const preferencesEnabled = currentSelection.preferences;
  const analyticsEnabled = currentSelection.analytics;
  const marketingEnabled = currentSelection.marketing;
  const cookiePolicyHref = "/cookie-policy";
  const policyHref = "/privacy-policy";

  const labels =
    language === "fi"
      ? {
          title: "Evasteasetukset",
          messageIntro:
            "Kaytamme valttamattomia evasteita sivuston toimintaan ja evasteasetustesi tallentamiseen.",
          messageNoAnalytics:
            "Voit halutessasi sallia analytiikka- ja markkinointievasteet parantamaan palveluamme.",
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
            "You can optionally allow analytics and marketing cookies to help us improve the experience.",
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

  const handleApply = (payload) => {
    applyConsent(payload);
    setDraft(null);
    setShowSettings(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  // Wait for first client render to decide; avoids SSR flash when consent already stored.
  if (!ready || consent.exists) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-live="polite" aria-modal="true">
      <div className={styles.banner}>
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
                onChange={(event) =>
                  setDraft({
                    ...(draft ?? consent.state),
                    preferences: event.target.checked,
                  })
                }
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
                onChange={(event) =>
                  setDraft({
                    ...(draft ?? consent.state),
                    analytics: event.target.checked,
                  })
                }
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
                onChange={(event) =>
                  setDraft({
                    ...(draft ?? consent.state),
                    marketing: event.target.checked,
                  })
                }
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
              onClick={() => handleApply(makeRejectPayload())}
            >
              {labels.decline}
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => handleApply(makeAcceptAllPayload())}
            >
              {labels.acceptAll}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                handleApply(
                  makePayload({
                    necessary: true,
                    preferences: preferencesEnabled,
                    analytics: analyticsEnabled,
                    marketing: marketingEnabled,
                  })
                )
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
              onClick={() => handleApply(makeRejectPayload())}
            >
              {labels.decline}
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => handleApply(makeAcceptAllPayload())}
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
    </div>
  );
}
