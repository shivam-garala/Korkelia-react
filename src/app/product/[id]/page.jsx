import SiteFooter from "../../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../../components/Home/SiteHeader.jsx";
import Container from "../../../components/ui/Container.jsx";
import ProductCustomizer from "../../../components/Product/ProductCustomizer.jsx";
import ProductGallery from "../../../components/Product/ProductGallery.jsx";
import ShareProductModal from "../../../components/Product/ShareProductModal.jsx";
import RelatedProducts from "./RelatedProducts.jsx";
import styles from "./page.module.css";

export default async function ProductDetailsPage({ params, searchParams }) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const { id } = resolvedParams ?? {};

  const readSearchParam = (source, key) => {
    if (!source) return "";
    if (typeof source.get === "function") {
      return source.get(key) ?? "";
    }
    const value = source[key];
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
  };

  const defaultMetalId = readSearchParam(resolvedSearchParams, "metal_id");
  const defaultKaratId = readSearchParam(resolvedSearchParams, "karat_id");
  const defaultDiamondTypeId = readSearchParam(resolvedSearchParams, "diamond_type_id");
  const defaultClarityId = readSearchParam(resolvedSearchParams, "clarity_id");
  const defaultCarat = readSearchParam(resolvedSearchParams, "carat");
  const defaultCutId = readSearchParam(resolvedSearchParams, "cut_id");
  const designId = readSearchParam(resolvedSearchParams, "design_id");
  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <Container>
          <div className={styles.topRow}>
            <ShareProductModal buttonClassName={styles.shareBtn} />
          </div>
          <div className={styles.topLine} aria-hidden />

          {/* <div className={styles.layoutContainer}> */}
            <div className={styles.layout}>
              <div className={styles.gallery}>
                <ProductGallery
                  productId={id ?? ""}
                  designId={designId ?? ""}
                />
              </div>

              <div className={styles.customizer}>
                <ProductCustomizer
                  // title={`PRODUCT NAME ${id ? `#${id}` : ""}`}
                  title={`...`}
                  productId={id ?? ""}
                  designId={designId ?? ""}
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

          <RelatedProducts productId={id ?? ""} designId={designId} />
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
