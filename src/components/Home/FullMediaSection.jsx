import Image from "next/image";
import Link from "next/link";
import styles from "./FullMediaSection.module.css";

export default function FullMediaSection({
  mediaType = "image",
  mediaSrc,
  posterSrc,
  eyebrow,
  title,
  subtitle,
  description,
  ctaLabel = "DISCOVER (LÖYDÄ)",
  href = "#",
  tone = "dark",
  align = "left",
}) {
  const isVideo = mediaType === "video";

  return (
    <section
      className={[
        styles.section,
        tone === "light" ? styles.toneLight : styles.toneDark,
        align === "right" ? styles.alignRight : styles.alignLeft,
      ].join(" ")}
    >
      <div className={styles.media} aria-hidden>
        {isVideo ? (
          <video
            className={styles.video}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc}
          >
            <source src={mediaSrc} />
          </video>
        ) : (
          <Image className={styles.image} src={mediaSrc} alt="" fill priority sizes="100vw" />
        )}
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className={styles.text}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
          {ctaLabel ? (
            <Link className={styles.cta} href={href}>
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
