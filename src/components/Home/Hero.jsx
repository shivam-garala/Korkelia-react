import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero({
  imageSrc,
  videoSrc,
  posterSrc,
  eyebrow,
  title,
  subcopy,
  primaryCta,
  secondaryCta,
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.media} aria-hidden>
        {videoSrc ? (
          <video
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc}
          >
            <source src={videoSrc} />
          </video>
        ) : (
          <Image className={styles.image} src={imageSrc} alt="" fill priority />
        )}
        <div className={styles.overlay} />
      </div>
      <div className={styles.content}>
        <div className={styles.contentInner}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          {subcopy ? <p className={styles.subcopy}>{subcopy}</p> : null}
          <div className={styles.ctaRow}>
            {primaryCta ? (
              <Link className={styles.cta} href={primaryCta.href}>
                {primaryCta.label}
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link className={`${styles.cta} ${styles.ctaSecondary}`} href={secondaryCta.href}>
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
