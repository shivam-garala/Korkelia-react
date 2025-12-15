import styles from "./ProductGrid.module.css";
import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ products, columns = 3 }) {
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

