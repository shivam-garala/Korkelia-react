import Image from "next/image";
import SiteFooter from "../../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../../components/Home/SiteHeader.jsx";
import Container from "../../../components/ui/Container.jsx";
import ProductCustomizer from "../../../components/Product/ProductCustomizer.jsx";
import ProductGallery from "../../../components/Product/ProductGallery.jsx";
import ProductGrid from "../../../components/Product/ProductGrid.jsx";
import styles from "./page.module.css";

export default async function ProductDetailsPage({ params, searchParams }) {
  const { id } = await params;
  const defaultMetalId = searchParams?.metal_id ?? "";
  const defaultKaratId = searchParams?.karat_id ?? "";
  const defaultDiamondTypeId = searchParams?.diamond_type_id ?? "";
  const defaultClarityId = searchParams?.clarity_id ?? "";
  const defaultCarat = searchParams?.carat ?? "";
  const defaultCutId = searchParams?.cut_id ?? "";
  const galleryItems = [
    { key: "a", variant: "square", src: "/productdetails/1.jpg" },
    { key: "b", variant: "tall", src: "/productdetails/2.jpg" },
    { key: "c", variant: "circle", src: "/productdetails/3.jpg" },
    { key: "d", variant: "wide", src: "/productdetails/4.jpg" },
    {
      key: "e",
      variant: "video",
      src: "/productdetails/4.jpg",
      badge: "play",
      videoSrc: "/productdetails/Rose%20Anim%20Kastehelmi%20Mq%20Rd%201725.mp4",
    },
  ];
  const related = [
    { id: "r1", name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/2" },
    { id: "r2", name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/3" },
    { id: "r3", name: "PRODUCT NAME", price: "\u20AC 3,000", imageSrc: "/productlisting/White_Pers_Palladim_4mm_0001.png", href: "/product/4" },
  ];

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topRow}>
            <button className={styles.shareBtn} type="button" aria-label="Share">
              <Image src="/icons/share.png" alt="" width={14} height={14} />
            </button>
          </div>
          <div className={styles.topLine} aria-hidden />

          {/* <div className={styles.layoutContainer}> */}
            <div className={styles.layout}>
              <div className={styles.gallery}>
                <ProductGallery items={galleryItems} />
              </div>

              <div className={styles.customizer}>
                <ProductCustomizer
                  title={`PRODUCT NAME ${id ? `#${id}` : ""}`}
                  productId={id ?? ""}
                  defaultMetalId={defaultMetalId}
                  defaultKaratId={defaultKaratId}
                  defaultDiamondTypeId={defaultDiamondTypeId}
                  defaultClarityId={defaultClarityId}
                  defaultCarat={defaultCarat}
                  defaultCutId={defaultCutId}
                />
              </div>
            </div>
          {/* </div> */}

          <div className={styles.related}>
            <h2 className={styles.relatedTitle}>RELATED PRODUCTS</h2>
            <div className={styles.relatedGrid}>
              <ProductGrid products={related} columns={3} />
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
