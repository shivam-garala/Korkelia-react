"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./SiteFooter.module.css";
import { useI18n } from "../../providers/I18nProvider.jsx";
import CookieBanner from "../ui/CookieBanner.jsx";

const socials = [
  { href: "#", src: "/icons/facebook.png", alt: "Facebook" },
  { href: "#", src: "/icons/othersocial.png", alt: "other social" },
  { href: "#", src: "/icons/pintrest.png", alt: "Pinterest" },
  { href: "#", src: "/icons/insta.png", alt: "Instagram" },
  { href: "#", src: "/icons/youtube.png", alt: "YouTube" },
  { href: "#", src: "/icons/xtwitter.png", alt: "X" },
];

export default function SiteFooter() {
  const { t } = useI18n();

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          <div className={styles.topRow}>
            <div>
              <p className={styles.brandTitle}>{t("footer.brandTitle")}</p>
              <p className={styles.brandCopy}>
                {t("footer.brandCopyLine1")}
                <br />
                {t("footer.brandCopyLine2")}
              </p>
            </div>

            <div>
              <p className={styles.infoTitle}>{t("footer.infoTitle")}</p>
              <nav className={styles.infoLinks} aria-label={t("footer.infoTitle")}>
                <Link className={styles.link} href="#">
                  {t("footer.links.privacy")}
                </Link>
                <Link className={styles.link} href="#">
                  {t("footer.links.shippingReturns")}
                </Link>
                <Link className={styles.link} href="/contact">
                  {t("footer.links.contact")}
                </Link>
              </nav>
            </div>
          </div>

          <div className={styles.divider} aria-hidden />

          <div className={styles.bottomRow}>
            <div className={styles.meta}>
              <span><span style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '2px' }}>Ac</span>{t("footer.copyrightLine1")}</span>
            </div>

            <div className={styles.logoWrap} aria-hidden>
              <Image
                className={styles.logo}
                src="/logo/footer_logo.png"
                alt="Korkeila Helsinki"
                width={180}
                height={80}
              />
            </div>

            <div className={styles.social} aria-label="Social media">
              {socials.map((social) => (
                <Link key={social.alt} className={styles.socialLink} href={social.href}>
                  <Image className={styles.socialIcon} src={social.src} alt={social.alt} width={18} height={18} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
      <CookieBanner />
    </>
  );
}
