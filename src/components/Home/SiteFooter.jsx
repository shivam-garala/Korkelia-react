import Link from "next/link";
import Image from "next/image";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div>
            <p className={styles.brandTitle}>KORKEILA HALSINKI</p>
            <p className={styles.brandCopy}>
              Kultasepänliike Helsingissä. Tilaustyöt, kulta- ja hopeakorut.
              <br />
              Laboratorio- ja luonnontimantit.
            </p>
          </div>

          <div>
            <p className={styles.infoTitle}>INFORMATION</p>
            <nav className={styles.infoLinks} aria-label="Information">
              <Link className={styles.link} href="#">
                Privacy Policy
              </Link>
              <Link className={styles.link} href="#">
                Shipping Policy
              </Link>
              <Link className={styles.link} href="#">
                Returns
              </Link>
              <Link className={styles.link} href="#">
                Search the Site
              </Link>
            </nav>
          </div>
        </div>

        <div className={styles.divider} aria-hidden />

        <div className={styles.bottomRow}>
          <div className={styles.meta}>
            © Korkeila Helsinki.
            <br />
            All rights reserved.
          </div>

          <div className={styles.logoWrap} aria-hidden>
            <Image
              className={styles.logo}
              src="/logo/footer_logo.png"
              alt=""
              width={200}
              height={80}
            />
          </div>

          <div className={styles.icons} aria-label="Social">
            <span className={styles.icon} aria-hidden>
              f
            </span>
            <span className={styles.icon} aria-hidden>
              p
            </span>
            <span className={styles.icon} aria-hidden>
              ig
            </span>
            <span className={styles.icon} aria-hidden>
              in
            </span>
            <span className={styles.icon} aria-hidden>
              y
            </span>
            <span className={styles.icon} aria-hidden>
              x
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

