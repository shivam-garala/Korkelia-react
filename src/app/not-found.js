"use client";

import Link from "next/link";
import SiteFooter from "../components/Home/SiteFooter.jsx";
import SiteHeader from "../components/Home/SiteHeader.jsx";
import Container from "../components/ui/Container.jsx";
import { useI18n } from "../providers/I18nProvider.jsx";
import styles from "./not-found.module.css";

const contentByLanguage = {
  en: {
    heading: "Page not found",
    message:
      "Sorry, we couldn't find the page you were looking for. It may have been moved, renamed, or the link may be incorrect.",
    cta: "Back to homepage",
  },
  fi: {
    heading: "Sivua ei löytynyt",
    message:
      "Valitettavasti etsimääsi sivua ei löytynyt. Se on saatettu siirtää, nimetä uudelleen tai osoite on virheellinen.",
    cta: "Takaisin etusivulle",
  },
};

export default function NotFound() {
  const { language } = useI18n();
  const languageKey = language === "fi" ? "fi" : "en";
  const content = contentByLanguage[languageKey] ?? contentByLanguage.en;

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <p className={styles.code}>404</p>
          <h1 className={styles.heading}>{content.heading}</h1>
          <p className={styles.message}>{content.message}</p>
          <Link className={styles.cta} href="/">
            {content.cta}
          </Link>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
