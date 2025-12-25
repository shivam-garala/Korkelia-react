import Image from "next/image";
import Link from "next/link";
import Skeleton from "../../app/components/ui/Skeleton.jsx";
import styles from "./CategoryGrid.module.css";

export default function CategoryGrid({
  title = "CATEGORIES",
  categories = [],
  loading = false,
}) {
  const isRemoteSrc = (src) => /^https?:\/\//i.test(src);

  if (loading) {
    return (
      <section className={styles.section} aria-hidden>
        <div className={styles.inner}>
          <h2 className={styles.heading}>
            <Skeleton width={180} height={18} />
          </h2>
          <div className={styles.grid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`category-skeleton-${index}`} className={styles.card}>
                <div className={styles.media}>
                  <Skeleton width="100%" height="100%" />
                </div>
                <div className={styles.label}>
                  <Skeleton width="70%" height={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>{title}</h2>
        <div className={styles.grid}>
          {categories.map((category) => {
            const resolvedSrc = category.imageSrc || "/productlisting/no_image.jpg";
            return (
              <Link
                key={category.id ?? `${category.href}-${category.label}`}
                className={styles.card}
                href={category.href}
              >
                <div className={styles.media} aria-hidden>
                  {isRemoteSrc(resolvedSrc) ? (
                    <img className={styles.image} src={resolvedSrc} alt={category.label ?? ""} />
                  ) : (
                    <Image className={styles.image} src={resolvedSrc} alt={category.label ?? ""} fill />
                  )}
                </div>
                <p className={styles.label}>{category.label}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
