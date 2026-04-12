"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Container from "../../components/ui/Container.jsx";
import SiteFooter from "../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../components/Home/SiteHeader.jsx";
import {
  DEFAULT_CONSENT_STATE,
  applyConsent,
  getConsentSnapshot,
  makeAcceptAllPayload,
  makePayload,
  makeRejectPayload,
  subscribeConsent,
} from "../../lib/cookieConsent.js";
import styles from "./page.module.css";

// Stable server snapshot fallback for useSyncExternalStore
const SERVER_CONSENT_SNAPSHOT = { exists: false, state: { ...DEFAULT_CONSENT_STATE } };
const getServerConsent = () => SERVER_CONSENT_SNAPSHOT;

const cookieInventory = [
  {
    name: "cookieConsent",
    provider: "Korkeila Helsinki website",
    category: "Strictly necessary",
    purpose: "Stores cookie preference choice",
    duration: "365 days",
  },
  {
    name: "Technical cookies set by hosting/infrastructure (if applicable)",
    provider: "Hosting / infrastructure",
    category: "Strictly necessary",
    purpose: "Security, load balancing, technical operation",
    duration: "Session / varies by configuration",
  },
  {
    name: "siteLang",
    provider: "Korkeila Helsinki website",
    category: "Preference / functional",
    purpose: "Stores user's language preference (e.g., English, Finnish)",
    duration: "365 days",
  },
  {
    name: "GRECAPTCHA (and/orotherreCAPTCHAcookiesdepending on implementation)",
    provider: "Google reCAPTCHA / Google",
    category: "Strictlynecessary",
    purpose: "Anti-botprotection / abuse prevention",
    duration: "Varies (set by Google)",
  },
];

const renderList = (items) => (
  <ul className={styles.list}>
    {items.map((item) => (
      <li key={item} className={styles.listItem}>
        {item}
      </li>
    ))}
  </ul>
);

export default function CookiePolicyPage() {
  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsent);
  const [cookiePreferences, setCookiePreferences] = useState(consent.state);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setCookiePreferences(consent.state);
  }, [consent.state]);

  const syncSave = (payload) => {
    const state = applyConsent(payload);
    setCookiePreferences(state);
    setStatusMessage("Cookie preferences updated.");
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleAcceptAll = () => syncSave(makeAcceptAllPayload());
  const handleReject = () => syncSave(makeRejectPayload());
  const handleSave = () =>
    syncSave(
      makePayload({
        necessary: true,
        preferences: cookiePreferences.preferences,
        analytics: cookiePreferences.analytics,
        marketing: cookiePreferences.marketing,
      })
    );

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />
          <div className={styles.header}>
            <h2 className={styles.heading}>Cookie Policy</h2>
            <p className={styles.intro}>
              This Cookie Policy explains how Greenbridge Oy (brand: Korkeila Helsinki) (&quot;we&quot;, &quot;us&quot;)
              uses cookies and similar technologies on our website, and how you can manage your choices.
              This Cookie Policy should be read together with our{" "}
              <a className={styles.inlineLink} href="/privacy-policy">
                Privacy Policy
              </a>
              , which explains how we process personal data more generally.
            </p>
          </div>

          <div className={styles.content}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>1. What are cookies and similar technologies?</h3>
              <p className={styles.paragraph}>
                Cookies are small text files that websites store on your device (computer, smartphone,
                tablet) when you visit. Cookies help the website function, improve user experience, and
                (if enabled) provide analytics and marketing insights.
              </p>
              <p className={styles.paragraph}>We may also use similar technologies such as:</p>
              {renderList([
                "pixels/tags (small code snippets used to measure performance of campaigns), and",
                "local storage (browser storage used for preferences or technical functions).",
              ])}
              <p className={styles.paragraph}>For simplicity, we refer to all of the above as &quot;cookies&quot;.</p>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>2. Who sets cookies?</h3>
              <p className={styles.paragraph}>Cookies can be set by:</p>
              {renderList([
                "First-party cookies - set by our website domain; and",
                "Third-party cookies - set by external service providers integrated into the site (e.g., analytics, marketing platforms, security/anti-bot tools such as Google reCAPTCHA).",
              ])}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>3. What cookie categories we use</h3>
              <p className={styles.paragraph}>
                We use the following categories. The cookie preferences tool on our website allows you to
                manage non-essential categories.
              </p>

              <div className={styles.subsections}>
                <div className={styles.subsection}>
                  <h4 className={styles.subTitle}>A) Strictly necessary cookies (always active)</h4>
                  <p className={styles.paragraph}>
                    These cookies are required for the website to operate securely and properly. They are
                    used for purposes such as:
                  </p>
                  {renderList([
                    "storing your cookie preference choice,",
                    "website security and abuse prevention,",
                    "session management and load balancing,",
                    "basic functionality required to operate the website, and",
                    "anti-bot protection (including Google reCAPTCHA where implemented).",
                  ])}
                  <p className={styles.paragraph}>
                    Legal basis: strictly necessary cookies are used because they are required for the
                    functioning of the website (non-optional). You can still block cookies through browser
                    settings, but this may cause the website not to function correctly.
                  </p>
                </div>

                <div className={styles.subsection}>
                  <h4 className={styles.subTitle}>B) Preference / functional cookies (optional)</h4>
                  <p className={styles.paragraph}>
                    These cookies remember your preferences and choices (e.g., language, layout/display
                    choices), if enabled.
                  </p>
                  <p className={styles.paragraph}>Legal basis: consent (where required).</p>
                </div>

                <div className={styles.subsection}>
                  <h4 className={styles.subTitle}>C) Analytics / performance cookies (optional)</h4>
                  <p className={styles.paragraph}>
                    These cookies help us understand how visitors use the website (e.g., pages visited,
                    time spent, technical errors), if enabled.
                  </p>
                  <p className={styles.paragraph}>Legal basis: consent.</p>
                </div>

                <div className={styles.subsection}>
                  <h4 className={styles.subTitle}>D) Marketing / advertising cookies (optional)</h4>
                  <p className={styles.paragraph}>
                    These cookies may be used to measure marketing performance and show relevant content
                    on third-party platforms, if enabled.
                  </p>
                  <p className={styles.paragraph}>Legal basis: consent.</p>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>4. How to manage your cookie choices</h3>
              <div className={styles.subsections}>
                <div className={styles.subsection}>
                  <h4 className={styles.subTitle}>A) Cookie preferences tool</h4>
                  <p className={styles.paragraph}>
                    You can manage cookies at any time using the cookie preferences tool on our website:
                  </p>
                  {renderList([
                    "Accept all - enables all optional cookies",
                    "Reject non-essential - keeps only strictly necessary cookies",
                    "Preferences - allows you to choose categories",
                  ])}
                </div>

                <div className={styles.subsection}>
                  <h4 className={styles.subTitle}>B) Browser settings</h4>
                  <p className={styles.paragraph}>
                    You can also control cookies through your browser settings (e.g., block cookies, delete
                    stored cookies). If you block strictly necessary cookies, parts of the website may not
                    work.
                  </p>
                </div>
              </div>

              <div className={styles.preferencesPanel} aria-live="polite">
                <h4 className={styles.panelTitle}>Update cookie preferences</h4>
                <p className={styles.panelNote}>Use the options below to update your cookie preferences at any time.</p>
                <div className={styles.panelRow}>
                  <div className={styles.panelText}>
                    <div className={styles.panelLabel}>Strictly necessary</div>
                    <div className={styles.panelHint}>Always on. Required for the site to function.</div>
                  </div>
                  <input className={styles.toggle} type="checkbox" checked readOnly disabled />
                </div>
                <div className={styles.panelRow}>
                  <div className={styles.panelText}>
                    <div className={styles.panelLabel}>Preferences</div>
                    <div className={styles.panelHint}>Remembers choices like language and layout.</div>
                  </div>
                  <input
                    className={styles.toggle}
                    type="checkbox"
                    checked={cookiePreferences.preferences}
                    onChange={(event) =>
                      setCookiePreferences((prev) => ({
                        ...prev,
                        preferences: event.target.checked,
                      }))
                    }
                  />
                </div>
                <div className={styles.panelRow}>
                  <div className={styles.panelText}>
                    <div className={styles.panelLabel}>Analytics</div>
                    <div className={styles.panelHint}>Helps us understand site usage.</div>
                  </div>
                  <input
                    className={styles.toggle}
                    type="checkbox"
                    checked={cookiePreferences.analytics}
                    onChange={(event) =>
                      setCookiePreferences((prev) => ({
                        ...prev,
                        analytics: event.target.checked,
                      }))
                    }
                  />
                </div>
                <div className={styles.panelRow}>
                  <div className={styles.panelText}>
                    <div className={styles.panelLabel}>Marketing</div>
                    <div className={styles.panelHint}>Personalized content and offers.</div>
                  </div>
                  <input
                    className={styles.toggle}
                    type="checkbox"
                    checked={cookiePreferences.marketing}
                    onChange={(event) =>
                      setCookiePreferences((prev) => ({
                        ...prev,
                        marketing: event.target.checked,
                      }))
                    }
                  />
                </div>
                <div className={styles.panelActions}>
                  <button type="button" className={styles.secondaryButton} onClick={handleReject}>
                    Reject non-essential
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={handleAcceptAll}>
                    Accept all
                  </button>
                  <button type="button" className={styles.primaryButton} onClick={handleSave}>
                    Save preferences
                  </button>
                </div>
                {statusMessage ? <p className={styles.statusMessage}>{statusMessage}</p> : null}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>5. Do we use cookies that process personal data?</h3>
              <p className={styles.paragraph}>
                Some cookies (especially analytics and marketing cookies) may involve processing of personal
                data (such as online identifiers or IP addresses). Where this occurs, the processing is described
                in our Privacy Policy.
              </p>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>6. Cookie list (cookies used on the website)</h3>
              <p className={styles.paragraph}>
                We aim to keep a current list of cookies used on the website. Cookies may change depending on
                website features and tools enabled.
              </p>

              <div className={styles.subsections}>
                <div className={styles.subsection}>
                  <h4 className={styles.subTitle}>Phase 1 - current setup</h4>
                  <p className={styles.paragraph}>At the time of this version:</p>
                  {renderList([
                    "We use Google reCAPTCHA (by Google LLC) to protect our forms from spam and abuse.",
                    "Google reCAPTCHA may set cookies and process personal data (such as IP address and device information).",
                    "We use a custom-coded cookie banner to obtain user consent.",
                    "We do not use analytics or advertising cookies at this stage, except those set by Google reCAPTCHA for security and fraud prevention..",
                  ])}
                </div>

                <div className={styles.subsection}>
                  <h4 className={styles.subTitle}>Cookie inventory table</h4>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.tableHead}>Cookie name</th>
                          <th className={styles.tableHead}>Provider</th>
                          <th className={styles.tableHead}>Category</th>
                          <th className={styles.tableHead}>Purpose</th>
                          <th className={styles.tableHead}>Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cookieInventory.map((cookie) => (
                          <tr key={cookie.name}>
                            <td className={styles.tableCell}>{cookie.name}</td>
                            <td className={styles.tableCell}>{cookie.provider}</td>
                            <td className={styles.tableCell}>{cookie.category}</td>
                            <td className={styles.tableCell}>{cookie.purpose}</td>
                            <td className={styles.tableCell}>{cookie.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <p className={styles.paragraph}>
                Future changes: If we enable analytics/marketing tools (we will update this Cookie Policy and
                cookie inventory before activation. Non-essential cookies will be used only with your consent).
              </p>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>7. Changes to this Cookie Policy</h3>
              <p className={styles.paragraph}>
                We may update this Cookie Policy when we add or change cookies/tools (e.g., introduce
                analytics/marketing services). The updated version will be posted on this page with a revised
                &quot;Last updated&quot; date.
              </p>
            </section>

            <section className={`${styles.section} ${styles.contactSection}`}>
              <h3 className={styles.sectionTitle}>8. Contact</h3>
              <p className={styles.paragraph}>
                If you have questions about cookies or personal data processing, contact:
              </p>
              <p className={styles.paragraph}>
                <a className={styles.contactLink} href="mailto:korkeila@korkeilahelsinki.fi">
                  korkeila@korkeilahelsinki.fi
                </a>
              </p>
              <p className={styles.updated}>Last updated: 13 January 2026</p>
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
