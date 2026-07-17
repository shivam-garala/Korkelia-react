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
    At Korkeila Helsinki, we believe that a wedding ring is more than jewellery. It is a symbol of commitment, a reflection of your love story, and a daily reminder of the bond you share. For couples searching for a refined wedding band Singapore, we offer wedding bands and wedding rings crafted with Scandinavian elegance and exceptional craftsmanship.
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
  const normalized = normalizeLabel(label)
   
    .toLowerCase();

  return normalized.includes("wedding band");
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
  }, [languageId, currencyCode,currencySymbol]);

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
                Wedding Band Singapore 
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
                  <p className={styles.intro}>Whether you are choosing your wedding rings in Singapore or selecting them from abroad, our collection is designed to honour the depth of your promise and the grace of your journey together.</p>
                  
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="/link6/img1.jpeg"
                      alt="Weding-Bands-Singapore image - 1"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      The Meaning Of A Wedding Band
                    </h2>
                    <p className={styles.sectionCopy}>
                      A wedding band is the symbol of your love and fidelity. Worn every day, the ring becomes part of your life, resting close to the heart as a quiet reminder of your relationship.
                    </p>
                    <p className={styles.sectionCopy}>
                      Your wedding band represents both your commitment and your story. Unlike an engagement ring, which marks the beginning of a promise, a wedding ring celebrates the continuation of that promise through every moment you share.
                    </p>
                    <p className={styles.sectionCopy}>
                     For many couples, wedding bands are chosen together. This shared decision reflects the unity of two people becoming one, a powerful symbol of love and partnership.
                    </p>
                    <h2 className={styles.storyHeading}>
                     A Collection Of Wedding Rings Crafted With Care
                    </h2>
                    <p className={styles.sectionCopy}>
                                  
                      Our collection of wedding rings is designed with balance, elegance and purpose. Each band is crafted by skilled artisans who understand that these pieces will accompany you for a lifetime.
                    </p>
                     <p className={styles.sectionCopy}>
                                  
                      We offer a refined range of wedding bands in gold, white gold and carefully selected metals. From minimalist styles to designs featuring subtle diamond accents, every wedding ring is created to honour your love story with understated sophistication.
                    </p>
                    <p className={styles.sectionCopy}>Our jewellery reflects Scandinavian luxury and simplicity. This harmonious influence ensures that your wedding band remains timeless, never defined by fleeting trends.</p>
                 
                   
                    <h2 className={styles.storyHeading}>
                      Diamond Wedding Rings And Refined Details
                    </h2>
                      <p className={styles.sectionCopy}>For those who desire additional brilliance, our diamond wedding rings offer refined beauty. A diamond wedding ring can feature delicate diamond accents or a continuous line of diamonds for added elegance.</p>
                    <p className={styles.sectionCopy}>
                     Diamond wedding rings are crafted to complement your engagement ring while standing beautifully on their own. Many couples in Singapore choose matching wedding bands that echo the design of their engagement rings, creating harmony between both rings.
                    </p>
                    <p className={styles.sectionCopy}>
                    Each diamond is selected for its quality and brilliance, ensuring your ring reflects the depth of your love and commitment.
                    </p>
                    <h2 className={styles.storyHeading}>
                      Designs For Men And Women
                    </h2>
                     <p className={styles.sectionCopy}>
                    Our wedding bands are thoughtfully designed for both men and women. While some prefer classic gold bands, others seek something with a subtle diamond touch.
                    </p>
                    <p className={styles.sectionCopy}>
                   For men, we offer wedding rings with clean lines and strong proportions. For women, options range from delicate bands with diamond accents to elegant white gold designs that sit gracefully beside an engagement ring.
                    </p>
                    <p className={styles.sectionCopy}>
                      Every design is created to ensure comfort and a perfect fit. Your wedding band should feel natural, becoming part of your daily life without compromise.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="/link2/e08c09ef-e4a9-4737-a4d6-23b987398285.jpeg"
                      alt="Weding-Bands-Singapore image - 2"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     Choosing The Perfect Wedding Ring In Singapore
                    </h2>
                    <p className={styles.sectionCopy}>Selecting wedding rings in Singapore is a meaningful step in your journey. There are several options to consider, including metal choice, diamond details, width, and finish.</p>
                    <p className={styles.sectionCopy}>
                     White gold remains a popular choice in Singapore for its luminous elegance, while traditional gold offers warmth and timeless appeal. Some couples prefer contemporary styles, while others look for classic bands that reflect the purity of their bond.
                    </p>
                     <p className={styles.sectionCopy}>
                      We guide you through ring size, fit, and design preference, ensuring your wedding band reflects both your individual style and shared commitment. Finding the right wedding ring is not simply about appearance, but about meaning.
                    </p>
                   







                    <h2 className={styles.storyHeading}>
                      Craftsmanship And Quality
                    </h2>
                     <p className={styles.sectionCopy}>
                      Every wedding band in our collection is crafted with exceptional craftsmanship. Our artisans pay attention to the smallest details, from polished edges to precise diamond settings.
                    </p>
                    <p className={styles.sectionCopy}>
                     Quality is at the core of our jewellery. Wedding rings are meant to last through a lifetime of moments, and our materials and techniques are selected to ensure durability and beauty.
                    </p>
                    
                  
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Personal Touch And Engraving</h2>
                    <p className={styles.sectionCopy}>
                      Many couples choose to personalize their wedding rings with engraving. A meaningful date, a promise, or a word that symbolizes your relationship adds a unique touch to your band.
                    </p>
                     <p className={styles.sectionCopy}>
                      This subtle detail transforms a wedding ring into something deeply personal. It becomes a reflection of your shared story and the journey you continue together.
                    </p>
                  </section>


                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Harmonizing With Your Engagement Ring</h2>
                    <p className={styles.sectionCopy}>
                     Your wedding band should complement your engagement ring. The balance between both rings is essential for a harmonious look.
                    </p>
                     <p className={styles.sectionCopy}>
                      Whether you pair a diamond wedding ring with a classic solitaire engagement ring or choose minimalist bands for a modern aesthetic, we help you achieve unity in design. The harmony of both rings symbolizes the strength of your relationship and the bond you share.
                    </p>
                     <p className={styles.sectionCopy}>
                     Many couples look for wedding bands that align with their engagement rings, creating a cohesive expression of love and fidelity.
                    </p>
                  </section>




                  <figure className={styles.storyImage}>
                    <Image
                      src="/link6/img0.jpeg"
                      alt="Weding-Bands-Singapore image - 3"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>Explore Our Wedding Bands In Singapore</h2>
                    <p className={styles.sectionCopy}>
                    Our collection of wedding bands is available for clients in Singapore and internationally. Each wedding ring is crafted with dedication, reflecting the elegance and sophistication that define Korkeila Helsinki.
                    </p>
                    <p className={styles.sectionCopy}>
                     Whether you prefer a simple gold band, a white gold ring with diamond accents, or diamond wedding rings with refined brilliance, we offer options to suit every couple.
                    </p>
                    <p className={styles.sectionCopy}>
                     Your wedding band is the symbol of your love, your promise, and your shared future. It represents one heart joining another, one story becoming two lives intertwined.
                    </p>
                      <p className={styles.sectionCopy}>
                    Discover wedding rings designed to celebrate your love story with grace and craftsmanship. We are honoured to help you find the perfect band to mark your lifelong commitment.
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
