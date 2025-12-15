import SiteFooter from "../../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../../components/Home/SiteHeader.jsx";
import Container from "../../../components/ui/Container.jsx";
import ProductCustomizer from "../../../components/Product/ProductCustomizer.jsx";
import ProductGallery from "../../../components/Product/ProductGallery.jsx";
import ProductGrid from "../../../components/Product/ProductGrid.jsx";
import styles from "./page.module.css";

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;

  const galleryItems = [
    { key: "a", variant: "square", src: "/others/1_prddetails.png" },
    { key: "b", variant: "tall", src: "/others/2_prd_details.png" },
    { key: "c", variant: "circle", src: "/others/1_prddetails.png" },
    { key: "d", variant: "wide", src: "/others/productandcategory.png" },
    { key: "e", variant: "video", src: "/others/1_prddetails.png", badge: "play" },
  ];

  const related = [
    { id: "r1", name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/2" },
    { id: "r2", name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/3" },
    { id: "r3", name: "PRODUCT NAME", price: "€ 3,000", imageSrc: "/others/productandcategory.png", href: "/product/4" },
  ];

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topLine} aria-hidden />

          <div className={styles.layout}>
            <div className={styles.gallery}>
              <div className={styles.share} aria-hidden>
                <span className={styles.shareIcon}>↗</span>
              </div>
              <ProductGallery items={galleryItems} />
            </div>

            <div className={styles.customizer}>
              <ProductCustomizer title={`PRODUCT NAME ${id ? `#${id}` : ""}`} />
            </div>
          </div>

          <div className={styles.related}>
            <h2 className={styles.relatedTitle}>RELATED PRODUCTS</h2>
            <div className={styles.relatedGrid}>
              <ProductGrid products={related} columns={3} />
            </div>
            <div className={styles.bottomLine} aria-hidden />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

