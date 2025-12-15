import Image from "next/image";
import Link from "next/link";
import styles from "./ProductCard.module.css";

export default function ProductCard({ href, imageSrc, name, price }) {
  const content = (
    <>
      <div className={styles.media} aria-hidden>
        <Image className={styles.image} src={imageSrc} alt="" fill />
      </div>
      <div className={styles.rule} aria-hidden />
      <div className={styles.meta}>
        <div className={styles.name}>{name}</div>
        {price ? <div className={styles.price}>{price}</div> : null}
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

