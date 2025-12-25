import Link from "next/link";
import styles from "./ProductCard.module.css";

export default function ProductCard({ href, imageSrc, name, price }) {
  const resolvedSrc = imageSrc || "/productlisting/no_image.jpg";
  const isRemoteSrc = /^https?:\/\//i.test(resolvedSrc);
  const content = (
    <>
      <div className={styles.media} aria-hidden>
        {isRemoteSrc ? (
          <img className={styles.image} src={resolvedSrc} alt={name ?? ""} />
        ) : (
          <img className={styles.image} src={resolvedSrc} alt={name ?? ""} />
        )}
      </div>
      <div className={styles.rule} aria-hidden />
      <div className={styles.meta}>
        <div className={styles.name}>{name}</div>
        <div className={styles.price}>{price ?? ""}</div>
      </div>
    </>
  );

  return href ? (
    <Link className={styles.card} href={href}>
      {content}
    </Link>
  ) : (
    <div className={styles.card}>{content}</div>
  );
}
