import Link from "next/link";
import Image from "next/image";
import styles from "./SiteFooter.module.css";

const socials = [
  { href: "#", src: "/icons/facebook.png", alt: "Facebook" },
  { href: "#", src: "/icons/pintrest.png", alt: "Pinterest" },
  { href: "#", src: "/icons/insta.png", alt: "Instagram" },
  { href: "#", src: "/icons/youtube.png", alt: "YouTube" },
  { href: "#", src: "/icons/xtwitter.png", alt: "X" },
];

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div>
            <p className={styles.brandTitle}>KORKEILA HELSINKI</p>
            <p className={styles.brandCopy}>
              Kultasepanliike Helsingissa. Tilaustyot, kulta- ja hopeakorut.
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
  );
}
