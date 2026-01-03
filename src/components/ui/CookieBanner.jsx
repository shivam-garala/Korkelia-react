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

  const labels =
    language === "fi"
      ? {
          title: "Evästeet",
          message:
            "Käytämme evästeitä parantaaksemme käyttökokemusta ja analysoidaksemme sivuston käyttöä.",
          accept: "Hyväksy",
          decline: "Hylkää",
        }
      : {
          title: "Cookies",
          message:
            "We use cookies to improve your experience and analyze site traffic.",
          accept: "Accept",
          decline: "Decline",
        };

  useEffect(() => {
    const existing = Cookies.get(COOKIE_KEY);
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const handleConsent = (value) => {
    Cookies.set(COOKIE_KEY, value, { expires: COOKIE_DAYS, sameSite: "lax", path: "/" });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite">
      <div className={styles.content}>
        <div className={styles.title}>{labels.title}</div>
        <p className={styles.message}>{labels.message}</p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => handleConsent("declined")}
        >
          {labels.decline}
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => handleConsent("accepted")}
        >
          {labels.accept}
        </button>
      </div>
    </div>
  );
}
