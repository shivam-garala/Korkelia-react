import Image from "next/image";
import Link from "next/link";
import styles from "./CategoryGrid.module.css";

export default function CategoryGrid({
  title = "CATEGORIES",
  categories = [],
}) {
  const isRemoteSrc = (src) => /^https?:\/\//i.test(src);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>{title}</h2>
        <div className={styles.grid}>
          {categories.map((category) => (
            <Link
              key={category.id ?? `${category.href}-${category.label}`}
              className={styles.card}
              href={category.href}
            >
              <div className={styles.media} aria-hidden>
                {isRemoteSrc(category.imageSrc) ? (
                  <img className={styles.image} src={category.imageSrc} alt={category.label ?? ""} />
                ) : (
                  <Image className={styles.image} src={category.imageSrc} alt={category.label ?? ""} fill />
                )}
              </div>
              <p className={styles.label}>{category.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
