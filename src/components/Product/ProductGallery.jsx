import Image from "next/image";
import styles from "./ProductGallery.module.css";

export default function ProductGallery({ items }) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div key={item.key ?? item.src} className={`${styles.cell} ${styles[item.variant] ?? ""}`}>
          <div className={styles.media} aria-hidden>
            <Image className={styles.image} src={item.src} alt="" fill />
            {item.badge === "play" ? <div className={styles.play} aria-hidden /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

