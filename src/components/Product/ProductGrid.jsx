import Skeleton from "../../app/components/ui/Skeleton.jsx";
import cardStyles from "./ProductCard.module.css";
import styles from "./ProductGrid.module.css";
import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products, columns = 3, loading = false }) {
  if (loading) {
    const count = Math.max(columns * 2, 6);
    return (
      <div className={styles.grid} style={{ "--columns": columns }}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={`product-skeleton-${index}`} className={cardStyles.card} aria-hidden>
            <div className={cardStyles.media}>
              <Skeleton width="100%" height="100%" />
            </div>
            <div className={cardStyles.rule} />
            <div className={cardStyles.meta}>
              <Skeleton width="80%" height={12} />
              <Skeleton width="50%" height={12} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.grid} style={{ "--columns": columns }}>
      {products.map((product) => (
        <ProductCard
          key={product.id ?? product.href ?? product.name}
          href={product.href}
          imageSrc={product.imageSrc}
          name={product.name}
          price={product.price}
        />
      ))}
    </div>
  );
}
