import Link from "next/link";
import styles from "./ProductCard.module.css";
import Image from "next/image";

export default function ProductCard({ href, imageSrc, name, price }) {
  const resolvedSrc = imageSrc || "/productlisting/no_image.jpg";
  const isRemoteSrc = /^https?:\/\//i.test(resolvedSrc);
  const hasPrice = price !== null && price !== undefined && String(price).trim() !== "";
  const displayPrice = hasPrice ? `${price}` : price ?? "";
  const content = (
    <>
      <div className={styles.media} aria-hidden>
        {isRemoteSrc ? (
          <Image className={styles.image} src={resolvedSrc} alt={name ?? ""} />
        ) : (
          <Image className={styles.image} src={resolvedSrc} alt={name ?? ""} />
        )}
      </div>
      <div className={styles.rule} aria-hidden />
      <div className={styles.meta}>
        <div className={styles.name}>{name}</div>
        <div className={styles.price}>{displayPrice}</div>
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
