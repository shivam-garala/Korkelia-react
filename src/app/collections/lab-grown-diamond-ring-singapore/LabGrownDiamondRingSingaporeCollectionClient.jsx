"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import SiteFooter from "../../../components/Home/SiteFooter.jsx";
import SiteHeader from "../../../components/Home/SiteHeader.jsx";
import FiltersBar from "../../../components/Product/FiltersBar.jsx";
import ProductGrid from "../../../components/Product/ProductGrid.jsx";
import Container from "../../../components/ui/Container.jsx";
import {
  clearProductListingCache,
  fetchProductListEcom,
  fetchSubCategoryHomePage,
} from "../../../lib/productListingCache.js";
import { useI18n } from "../../../providers/I18nProvider.jsx";
import styles from "./page.module.css";

const CATEGORY_ID = "1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.korkeilahelsinki.fi";

const buildSortOptions = (labels) => [
  { value: "price-asc", label: labels.lowToHigh },
  { value: "price-desc", label: labels.highToLow },
];

const introText = (
  <>
   At Korkeila Helsinki, we present a refined approach to the lab-grown diamond ring Singapore clients seek for timeless elegance and responsible luxury. A lab-grown diamond ring is more than a trend. It is a considered choice that combines beauty, innovation, and enduring craftsmanship.
  </>
);



export default function KihlasormusMiehelleCollectionClient() {
  const { language, currencyCode, currencySymbol, t } = useI18n();
  const [showAllContent, setShowAllContent] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [sortFilter, setSortFilter] = useState("featured");
  const languageId = language === "fi" ? "2" : "1";
  const labels = useMemo(
    () =>
      language === "fi"
        ? {
            subCategory: "Alakategoria",
            sortByPrice: "Lajittele hinnan mukaan",
            lowToHigh: "Halvin ensin",
            highToLow: "Kallein ensin",
          }
        : {
            subCategory: "Sub Category",
            sortByPrice: "Sort By Price",
            lowToHigh: "Low to High",
            highToLow: "High to Low",
          },
    [language]
  );
  const sortFilterOptions = useMemo(() => buildSortOptions(labels), [labels]);

  useEffect(() => {
    let active = true;

    const normalizeLabel = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase();

    const isMensRings = (label) => {
  const normalized = normalizeLabel(label).toLowerCase();

  return (
   
    normalized.includes("halo") ||
    normalized.includes("solitaire") ||
    normalized.includes("3 stones") ||
    normalized.includes("alliance")
  );
};

    const loadSubCategories = async () => {
      try {
        const list = await fetchSubCategoryHomePage(languageId, CATEGORY_ID);
        const mapped = list
          .map((item) => {
            const id = item?.id ?? item?.sub_category_id ?? null;
            const label = item?.sub_category_name ?? item?.name ?? "";
            if (!id || !label) return null;
            return { value: String(id), label: String(label) };
          })
          .filter(Boolean);

        const filtered = mapped.filter((option) => isMensRings(option.label));
        const finalOptions = filtered.length ? filtered : mapped;

        if (active) {
          setSubCategories(finalOptions);
          setSubCategoryFilter(
            (filtered.length ? filtered : finalOptions).map((option) => option.value)
          );
        }
      } catch (error) {
        if (active) {
          setSubCategories([]);
          setSubCategoryFilter([]);
        }
        console.error("Subcategory load failed", error);
      }
    };

    loadSubCategories();
    return () => {
      active = false;
    };
  }, [languageId]);

  useEffect(() => {
    let active = true;
    const apiBase =
      process.env.NEXT_PUBLIC_BASE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
    if (active) setProductsLoading(true);

    const normalizeImage = (image) => {
      if (!image) return "/productlisting/no_image.jpg";
      if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
      if (!apiBase) return image;
      return `${apiBase.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
    };

    const loadProducts = async () => {
      try {
        clearProductListingCache();
        const list = await fetchProductListEcom(languageId, CATEGORY_ID, currencyCode, currencySymbol);
        const mapped = list
          .map((item) => {
            const id = item?.id ?? item?.product_id ?? null;
            if (!id) return null;
            const design =
              item?.design ?? item?.design_variant ?? item?.designVariant ?? null;
            const designId =
              design?.id ??
              item?.design_id ??
              item?.designId ??
              item?.design_variant_id ??
              item?.designVariantId ??
              "";
            const metalRate = design?.metal_rate ?? null;
            const primaryDetail = Array.isArray(design?.diamond_details)
              ? design.diamond_details[0]
              : null;
            const diamondRate = primaryDetail?.diamond_rate ?? null;
            const query = new URLSearchParams();
            if (designId) query.set("design_id", String(designId));
            if (metalRate?.metal_id) query.set("metal_id", String(metalRate.metal_id));
            if (metalRate?.karat_id) query.set("karat_id", String(metalRate.karat_id));
            if (diamondRate?.diamond_type_id) {
              query.set("diamond_type_id", String(diamondRate.diamond_type_id));
            }
            if (diamondRate?.clarity_id) {
              query.set("clarity_id", String(diamondRate.clarity_id));
            }
            const caratValue =
              diamondRate?.diamond_master?.carat ??
              diamondRate?.diamond_master_id?.carat ??
              null;
            if (caratValue !== null && caratValue !== undefined) {
              query.set("carat", String(caratValue));
            }
            if (primaryDetail?.cut_master_id) {
              query.set("cut_id", String(primaryDetail.cut_master_id));
            }
            const translations = Array.isArray(design?.design_translations)
              ? design.design_translations
              : [];
            const matchingTranslation = translations.find(
              (translation) =>
                String(translation?.language_id ?? "") === String(languageId)
            );
            const translatedName =
              matchingTranslation?.design_variant_name ??
              matchingTranslation?.product_name ??
              null;

            return {
              id,
              name:
                translatedName ??
                design?.design_translation?.design_variant_name ??
                design?.design_variant_name ??
                item?.product_name ??
                item?.name ??
                "PRODUCT",
              price: item?.total_price ?? null,
              imageSrc: normalizeImage(item?.image),
              href: query.toString()
                ? `/product/${id}?${query.toString()}`
                : `/product/${id}`,
              subCategoryId: String(item?.sub_category_id ?? ""),
            };
          })
          .filter(Boolean);

        if (active) setProducts(mapped);
      } catch (error) {
        if (active) setProducts([]);
        console.error("Product list load failed", error);
      } finally {
        if (active) setProductsLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
    };
  }, [languageId, currencyCode, currencySymbol]);

  const displayedProducts = useMemo(() => {
    let list = products;
    if (subCategoryFilter.length) {
      const selected = new Set(subCategoryFilter.map((value) => String(value)));
      list = list.filter((item) => selected.has(String(item.subCategoryId)));
    }

    if (sortFilter === "price-asc" || sortFilter === "price-desc") {
      const parsePrice = (value) => {
        if (typeof value === "number") return value;
        const cleaned = String(value ?? "").replace(/[^\d.]/g, "");
        return cleaned ? Number(cleaned) : Number.NaN;
      };
      list = [...list].sort((a, b) => {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);
        if (Number.isNaN(priceA) && Number.isNaN(priceB)) return 0;
        if (Number.isNaN(priceA)) return 1;
        if (Number.isNaN(priceB)) return -1;
        return sortFilter === "price-asc" ? priceA - priceB : priceB - priceA;
      });
    }

    return list;
  }, [products, subCategoryFilter, sortFilter]);

  return (
    <div className={styles.page}>
      <SiteHeader />
      <main className={styles.main}>
        <section className={styles.storyWrap}>
          <Container>
            <div className={styles.topLine} aria-hidden />
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>
               Lab grown diamond ring Singapore
              </h1>
            </header>
            <article className={styles.story}>
              <p className={styles.intro}>{introText}</p>
              {!showAllContent ? (

                <div className={styles.toggleRow}>

                  <button
                  className={styles.toggleButton}
                  type="button"
                  onClick={() => setShowAllContent((prev) => !prev)}
                  aria-expanded={showAllContent}
                  aria-controls="story-content"
                >
                  {showAllContent ? "Show less" : "READ MORE"}
                </button>

                </div>

              ) : null}
              {showAllContent ? (
                <div className={styles.storyBody} id="story-content">
                  <p className={styles.intro}>In Singapore, couples are increasingly choosing lab-grown diamonds for engagement rings and meaningful jewellery pieces. With advances in lab technology, lab-grown diamonds are now indistinguishable from mined diamonds in brilliance, clarity, and durability.</p>
                  
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="/link2/e08c09ef-e4a9-4737-a4d6-23b987398285.jpeg"
                      alt="lab grodiamond Ring Singapore image 1"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     What Is A Lab Grown Diamond?
                    </h2>
                    <p className={styles.sectionCopy}>
                    A lab-grown diamond is a real diamond created in a controlled laboratory environment. Through advanced lab processes, scientists replicate the natural conditions under which diamonds form beneath the earth.
                    </p>
                    <p className={styles.sectionCopy}>
                     The result is a grown diamond that shares the same chemical composition and optical properties as natural diamonds. Lab-grown diamonds are graded for cut, clarity, colour, and carat weight, just like mined stones.
                    </p>
                    <p className={styles.sectionCopy}>
                    Lab-grown diamonds are not imitations. They are genuine diamonds, created with precision and care.
                    </p>
                    <h2 className={styles.storyHeading}>
                     The Difference Between Lab-Grown and Mined Diamonds
                    </h2>
                    <p className={styles.sectionCopy}>
                                  
                      The key difference lies in origin. While mined diamonds are formed naturally, lab-grown diamonds are produced in a laboratory.
                    </p>
                     <p className={styles.sectionCopy}>
                                  
                      Visually and structurally, there is no difference. Lab-grown diamonds in Singapore offer the same brilliance and beauty as mined stones. However, the price point is often more accessible.
                    </p>
                    <p className={styles.sectionCopy}>For many couples, this makes a lab-grown diamond engagement ring a thoughtful decision that balances value and symbolism.</p>
                 
                   
                    <h2 className={styles.storyHeading}>
                    Lab Grown Diamond Engagement Rings
                    </h2>
                      <p className={styles.sectionCopy}>A lab-grown diamond engagement ring carries the same meaning as any traditional diamond engagement ring. It symbolises love, commitment, and the beginning of a shared future.</p>
                    <p className={styles.sectionCopy}>
                     Our lab-grown diamond engagement collection includes refined engagement ring designs crafted to highlight the heart of the stone. Whether you prefer classic solitaires or contemporary settings, our diamond engagement rings showcase the brilliance of lab-grown diamonds.
                    </p>
                    <p className={styles.sectionCopy}>
                    In Singapore, grown diamond engagement rings are increasingly recognised for their quality and ethical appeal.
                    </p>
                    
                  </section>


                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    Finding The Perfect Lab-Grown Diamond
                    </h2>
                    <p className={styles.sectionCopy}>
                   Choosing the perfect lab-grown diamond begins with understanding cut and clarity. The precision of the cut determines brilliance, while clarity influences visual purity.
                    </p>
                    <p className={styles.sectionCopy}>
                     Our diamond specialists guide you through the selection process. We present a curated range of lab-grown diamonds in various shapes and carat sizes.
                    </p>
                    <p className={styles.sectionCopy}>
                    With our expertise, you can find the perfect lab-grown diamond that reflects your style and commitment.
                    </p>
                   
                    
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/lab_grown_ring_2.jpeg"
                      alt="lab grown diamond ring Singapore image 2"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     The Beauty Of Lab Grown Diamonds
                    </h2>
                    <p className={styles.sectionCopy}>Lab-grown diamonds are celebrated for their beauty and consistency. Because they are created in a lab environment, quality standards are carefully controlled.</p>
                    <p className={styles.sectionCopy}>
                   Lab-grown diamonds in Singapore offer excellent brilliance and symmetry. Each grown diamond is examined meticulously before being set into a ring.
                    </p>
                     <p className={styles.sectionCopy}>
                    The beauty of lab-grown diamonds lies in their clarity, fire, and precise formation.


                    </p>
                   







                    <h2 className={styles.storyHeading}>
                   Engagement Rings Crafted With Care
                    </h2>
                     <p className={styles.sectionCopy}>
                      An engagement ring is worn daily, making craftsmanship essential. Our lab-grown diamond rings are created with attention to structure and durability.
                    </p>
                    <p className={styles.sectionCopy}>
                   We offer engagement rings in gold settings that complement the diamond. The harmony between gold and lab-grown diamond enhances overall elegance.
                    </p>
                    <p className={styles.sectionCopy}>Each engagement ring is crafted to ensure lasting performance, allowing the ring to accompany you through life’s meaningful moments.</p>
                  
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Beyond Rings: A Complete Jewellery Collection</h2>
                    <p className={styles.sectionCopy}>
                      Our collection extends beyond engagement rings. We offer diamond rings, earrings, necklaces, pendants, bracelets, and even tennis bracelets featuring lab-grown diamonds.
                    </p>
                     <p className={styles.sectionCopy}>
                     These jewellery pieces are crafted with the same commitment to quality. Whether you seek a subtle pair of earrings or a statement pendant, our lab-grown diamonds deliver brilliance.
                    </p>
                   <p className={styles.sectionCopy}> Lab-grown diamonds in Singapore are suitable for anniversary gifts, personal milestones, and everyday elegance.</p>
                  </section>


                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Lab-Grown Diamonds In Singapore: Price And Value</h2>
                    <p className={styles.sectionCopy}>
                   One of the advantages of lab-grown diamonds is cost efficiency. Compared to mined diamonds, lab-grown diamonds typically offer greater size or higher clarity within a defined price range.
                    </p>
                    <p className={styles.sectionCopy}>
                   The price of a lab-grown diamond ring depends on carat weight, cut precision, and overall design. We provide transparent pricing during consultation.
                    </p>
                    <p className={styles.sectionCopy}>
                     This allows you to make an informed purchase decision that aligns with your expectations and budget.
                    </p>
                      
                  
                    
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Why Choose Lab-Grown Diamonds?</h2>
                    <p className={styles.sectionCopy}>
                  Lab-grown diamonds are an increasingly popular choice for clients who value innovation and sustainability. They provide the same durability and brilliance as mined stones.
                    </p>
                    <p className={styles.sectionCopy}>
                   Our lab-grown diamonds are selected to meet strict quality standards. With our lab-grown diamond engagement designs, couples can celebrate love while embracing modern technology.
                    </p>
                    <p className={styles.sectionCopy}>
                     For many in Singapore, the difference lies not in appearance but in philosophy.
                    </p>
                      
                  
                    
                  </section>


                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/lab_grown_ring_1.jpeg"
                      alt="lab grown diamond ring Singapore image 3"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>





                  
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Our Commitment To Quality And Craftsmanship</h2>
                    <p className={styles.sectionCopy}>
                   At Korkeila Helsinki, customer satisfaction remains central to our philosophy. Every lab-grown diamond ring is crafted with precision and care.
                    </p>
                    <p className={styles.sectionCopy}>
                   We ensure that each piece meets structural and aesthetic standards before it leaves our atelier. From diamond selection to final polish, quality defines every stage.
                    </p>
                    <p className={styles.sectionCopy}>
                    Our lab-grown diamonds are chosen for brilliance, value, and enduring elegance.
                    </p>
                      
                  
                    
                  </section>

                   <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Begin Your Lab-Grown Diamond Journey</h2>
                    <p className={styles.sectionCopy}>
                   If you are searching for the perfect lab-grown diamond ring that Singapore can offer, we invite you to explore our collection.
                    </p>
                    <p className={styles.sectionCopy}>
                   Whether you are selecting an engagement ring, diamond engagement ring, or refined jewellery piece for your loved one, our lab-grown diamonds provide a balance of beauty and responsibility.
                    </p>
                    <p className={styles.sectionCopy}>
                    Discover the perfect lab-grown diamond for your story on our online shop. With expertise, craftsmanship, and dedication, we help you choose something meaningful, a ring that symbolises love, commitment, and the brilliance of your shared future.
                    </p>
                      
                  
                    
                  </section>



                </div>
              ) : null}

              {showAllContent ? (

                <div className={styles.toggleRow}>

                  <button
                  className={styles.toggleButton}
                  type="button"
                  onClick={() => setShowAllContent((prev) => !prev)}
                  aria-expanded={showAllContent}
                  aria-controls="story-content"
                >
                  {showAllContent ? "Show less" : "Read more"}
                </button>

                </div>

              ) : null}
              <section className={styles.productSection}>
                <Container className={styles.productContainer}>
                  {/*
                  <div className={`${styles.sectionHeader} ${styles.productSectionHeader}`}>
                    <h2 className={`${styles.sectionTitle} ${styles.productHeading}`}>
                      Valikoima kihlasormuksia
                    </h2>
                    <p className={styles.sectionCopy}>
                      Inspiroidu suosituimmista malleista ja löydä oma säihkeesi. Alla esimerkkejä
                      kihlasormuksista eri tyyleissä.
                    </p>
                  </div>
                  */}
                  <div className={styles.filtersRow}>
                    <FiltersBar
                      leftLabel={labels.subCategory}
                      rightLabel={labels.sortByPrice}
                      leftValue={subCategoryFilter}
                      rightValue={sortFilter}
                      onLeftChange={setSubCategoryFilter}
                      onRightChange={setSortFilter}
                      leftOptions={subCategories}
                      rightOptions={sortFilterOptions}
                      leftMulti
                      leftDisabled
                    />
                  </div>
                  <div className={styles.gridWrap}>
                    <ProductGrid products={displayedProducts} columns={3} loading={productsLoading} />
                  </div>
                </Container>
              </section>
            </article>
          </Container>
        </section>
      </main>
      <SiteFooter brandDescription={t("footer.ringBrandDescription")} />
    </div>
  );
}
