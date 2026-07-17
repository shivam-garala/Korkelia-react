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
    At Korkeila Helsinki, we believe an engagement ring is more than jewellery. It is the symbol of your love, a promise that marks one of the most meaningful moments in life. For those in Singapore searching for an engagement ring, we offer refined Scandinavian elegance combined with uncompromising quality and craftsmanship.
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
  }, [languageId, currencyCode]);

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
               Engagement Ring Singapore
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
                  <p className={styles.intro}>Our atelier creates engagement rings that unite modern design with timeless beauty. Whether you are in Singapore or selecting your ring internationally, our collection of diamond engagement rings is crafted to honour the depth of your commitment.</p>
                  
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="/link2/fcf7f846-0cd8-42fc-90e7-da8f80dffbd6.jpeg"
                      alt="diamond Ring Singapore"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     A Collection Of Engagement Rings Designed To Last
                    </h2>
                    <p className={styles.sectionCopy}>
                     Each engagement ring in our collection is designed to reflect the individuality of your story. From classic solitaires to contemporary halo designs, our ring designs are crafted to celebrate love in its purest form.
                    </p>
                    <p className={styles.sectionCopy}>
                     Our curated collection of diamond engagement rings includes refined solitaires, elegant halo designs, and modern minimalist settings. Each diamond ring is crafted to highlight the brilliance and character of the stone, ensuring the perfect balance between elegance and durability.
                    </p>
                    <p className={styles.sectionCopy}>
                     We understand that couples value both heritage and innovation. That is why our collection combines traditional gold craftsmanship with modern lab-grown diamonds, offering the best of both worlds.
                    </p>
                    <h2 className={styles.storyHeading}>
                     Lab Grown Diamonds: Modern Brilliance With Purpose
                    </h2>
                    <p className={styles.sectionCopy}>
                                  
                      We proudly offer a refined selection of lab-grown diamonds. These lab diamonds are chemically and visually identical to mined diamonds, delivering the same brilliance and cut precision while supporting a more responsible choice.
                    </p>
                     <p className={styles.sectionCopy}>
                                  
                      Our lab-grown diamond engagement rings are crafted to the highest standards of quality. Each lab-grown diamond is carefully selected based on cut, clarity, colour, and carat weight. Many of our diamonds are graded by the Gemological Institute of America, ensuring full transparency and trust.
                    </p>
                    <p className={styles.sectionCopy}>Choosing lab-grown is not about compromise. It is about embracing innovation while preserving the elegance and beauty of a timeless ring. For many couples, lab-grown diamonds represent the perfect union of ethics and luxury.</p>
                 
                   
                    <h2 className={styles.storyHeading}>
                    Diamond Selection And Exceptional Quality
                    </h2>
                      <p className={styles.sectionCopy}>The heart of every diamond engagement ring is the diamond itself. Our experts guide you through the diamond selection process, helping you find the perfect stone based on diamond shape, cut, and carat weight.</p>
                    <p className={styles.sectionCopy}>
                     We offer a range of diamond shapes, including round, oval, cushion, and emerald cut. The cut of the diamond is essential to brilliance and fire, and we focus on the most precise proportions to maximise brilliance and light performance.
                    </p>
                    <p className={styles.sectionCopy}>
                    Each diamond ring is crafted with a commitment to quality. Our designers ensure that every setting enhances the natural beauty of the diamond while maintaining structural integrity for a lifetime of wear.
                    </p>
                    
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/b9255fba-3e37-445e-bdb8-c9d513d1ab9f.jpeg"
                      alt="sapphire engagement rings Singapore"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     Gold Craftsmanship And Scandinavian Elegance
                    </h2>
                    <p className={styles.sectionCopy}>Our engagement rings are available in white gold and other refined gold options, each crafted to complement the diamond selection. The harmony between gold and diamond is at the core of our design philosophy.</p>
                    <p className={styles.sectionCopy}>
                   Every piece is crafted to express understated elegance. Our designers focus on clean lines, balanced proportions, and thoughtful details. This Scandinavian style is designed to remain timeless, making your engagement ring the perfect companion through all of life’s moments.
                    </p>
                     <p className={styles.sectionCopy}>
                     Whether you prefer a classic diamond ring or a more distinctive sapphire engagement ring option, our jewellery reflects the highest level of craftsmanship.


                    </p>
                   







                    <h2 className={styles.storyHeading}>
                   Find The Perfect Ring In Singapore
                    </h2>
                     <p className={styles.sectionCopy}>
                      Selecting the perfect ring is a deeply personal journey. An engagement ring is the symbol of a promise, and it should reflect the uniqueness of your love.
                    </p>
                    <p className={styles.sectionCopy}>
                     We offer personalised guidance to help you find the perfect diamond ring. From selecting the ideal diamond shape to determining the correct ring size, our experts support you at every stage. With our commitment to quality and detail, finding the perfect ring becomes a meaningful experience rather than a transaction.
                    </p>
                    <p className={styles.sectionCopy}>Our engagement rings are available for sale with worldwide delivery. Each ring is crafted in Finland to meet the expectations of discerning clients seeking the best in fine jewellery.</p>
                  
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>A Range Of Designs For Every Love Story</h2>
                    <p className={styles.sectionCopy}>
                      Our collection features a selection of engagement rings designed to suit different styles. From minimalist solitaires to intricate halo designs with a lab-grown centre stone, each design is created to highlight the brilliance and character of the diamond.
                    </p>
                     <p className={styles.sectionCopy}>
                     We also offer diamond rings with a combination of diamonds and unique gemstones for those seeking something distinctive. Each engagement ring is designed to reflect both individuality and enduring elegance.
                    </p>
                   <p className={styles.sectionCopy}> With our commitment to excellence, every diamond engagement ring is crafted to become a cherished piece for generations.</p>
                  </section>


                  




                  <figure className={styles.storyImage}>
                    <Image
                      src="/link6/image_6.jpeg"
                      alt="Engagement-Ring-Singapore image"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>





                  
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Crafted To Celebrate The Most Meaningful Moments</h2>
                    <p className={styles.sectionCopy}>
                   An engagement ring is designed to mark one of the most important moments of your life. It is the beginning of a new chapter, a symbol of devotion to your loved one.
                    </p>
                    <p className={styles.sectionCopy}>
                   At Korkeila Helsinki, every diamond engagement ring is crafted to honour that promise. Our jewellery is designed to combine beauty, brilliance and quality in a single refined ring.
                    </p>
                    <p className={styles.sectionCopy}>
                     Explore our collection of engagement rings and discover the perfect balance between lab-grown innovation and traditional gold craftsmanship. Whether you are in Singapore or beyond, we are honoured to help you find the perfect expression of your love.
                    </p>
                      <p className={styles.sectionCopy}>
                    Discover the perfect ring with our timeless diamond engagement rings, crafted with precision, designed to last, and created to celebrate the brilliance of your commitment.
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
