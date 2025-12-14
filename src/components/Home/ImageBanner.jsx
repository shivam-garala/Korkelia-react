import Image from "next/image";
import Link from "next/link";
import styles from "./ImageBanner.module.css";

export default function ImageBanner({
  imageSrc,
  scheme = "light",
  shade = "light",
  align = "left",
  eyebrow,
  title,
  copy,
  cta,
}) {
  const shadeClass =
    shade === "light" ? styles.shadeLight : shade === "dark" ? styles.shadeDark : "";

  return (
    <section className={styles.banner}>
      <div className={styles.media} aria-hidden>
        <Image className={styles.image} src={imageSrc} alt="" fill />
        {shadeClass ? <div className={shadeClass} /> : null}
      </div>

      <div
        className={[
          styles.content,
          align === "right" ? styles.contentRight : styles.contentLeft,
          scheme === "dark" ? styles.schemeDark : styles.schemeLight,
        ].join(" ")}
      >
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h2 className={styles.title}>{title}</h2>
        {copy ? <p className={styles.copy}>{copy}</p> : null}
        {cta ? (
          <Link className={styles.cta} href={cta.href}>
            {cta.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
