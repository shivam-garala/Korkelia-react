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
  fetchAllCategories,
  fetchProductListEcom,
  fetchSubCategoryHomePage,
} from "../../../lib/productListingCache.js";
import { useI18n } from "../../../providers/I18nProvider.jsx";
import en from "../../../i18n/en.json";
import styles from "./page.module.css";

const buildSortOptions = (labels) => [
  { value: "price-asc", label: labels.lowToHigh },
  { value: "price-desc", label: labels.highToLow },
];

const normalizeImage = (image, apiBase) => {
  if (!image) return "/productlisting/no_image.jpg";
  if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
  if (!apiBase) return image;
  return `${apiBase.replace(/\/$/, "")}/${image.replace(/^\//, "")}`;
};

const mapProduct = (item, languageId, apiBase) => {
  const id = item?.id ?? item?.product_id ?? null;
  if (!id) return null;
  const design = item?.design ?? item?.design_variant ?? item?.designVariant ?? null;
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
  if (diamondRate?.diamond_type_id)
    query.set("diamond_type_id", String(diamondRate.diamond_type_id));
  if (diamondRate?.clarity_id)
    query.set("clarity_id", String(diamondRate.clarity_id));
  const caratValue =
    diamondRate?.diamond_master?.carat ??
    diamondRate?.diamond_master_id?.carat ??
    null;
  if (caratValue !== null && caratValue !== undefined)
    query.set("carat", String(caratValue));
  if (primaryDetail?.cut_master_id)
    query.set("cut_id", String(primaryDetail.cut_master_id));
  const translations = Array.isArray(design?.design_translations)
    ? design.design_translations
    : [];
  const matchingTranslation = translations.find(
    (t) => String(t?.language_id ?? "") === String(languageId)
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
    imageSrc: normalizeImage(item?.image, apiBase),
    href: query.toString()
      ? `/product/${id}?${query.toString()}`
      : `/product/${id}`,
    categoryId: String(item?.category_id ?? ""),
    subCategoryId: String(item?.sub_category_id ?? ""),
  };
};

const introText = (
  <>
   At Korkeila Helsinki, we present a refined collection of lab-grown diamonds Singapore clients can trust for exceptional quality and enduring beauty. For those seeking an engagement ring, diamond ring, or fine jewellery in Singapore, our lab-grown diamonds combine Scandinavian elegance with modern innovation.
  </>
);

export default function LabgrownDiamondSingaporeCollectionClient() {
  const { language, currencyCode, currencySymbol, t } = useI18n();
  const [showAllContent, setShowAllContent] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
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
            category: "Kategoria",
            subCategory: "Alakategoria",
            sortByPrice: "Lajittele hinnan mukaan",
            lowToHigh: "Halvin ensin",
            highToLow: "Kallein ensin",
          }
        : {
            category: "Category",
            subCategory: "Sub Category",
            sortByPrice: "Sort By Price",
            lowToHigh: "Low to High",
            highToLow: "High to Low",
          },
    [language]
  );

  const sortFilterOptions = useMemo(() => buildSortOptions(labels), [labels]);

  // Load all categories
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await fetchAllCategories(languageId);
        const raw = Array.isArray(list) ? list : list?.data ?? [];
        const mapped = raw
          .map((item) => {
            const id = item?.id ?? null;
            const label = item?.category_name ?? item?.name ?? "";
            if (!id || !label) return null;
            return { value: String(id), label: String(label) };
          })
          .filter(Boolean);
        if (active) setCategories(mapped);
      } catch (e) {
        if (active) setCategories([]);
        console.error("Category load failed", e);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [languageId]);

  // Load all products across all categories once categories are known
  useEffect(() => {
    if (categories.length === 0) return;
    let active = true;
    if (active) setProductsLoading(true);
    const apiBase =
      process.env.NEXT_PUBLIC_BASE_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

    const load = async () => {
      try {
        clearProductListingCache();
        const results = await Promise.all(
          categories.map((cat) =>
            fetchProductListEcom(languageId, cat.value, currencyCode, currencySymbol)
              .then((list) =>
                list.map((item) => mapProduct(item, languageId, apiBase)).filter(Boolean)
              )
              .catch(() => [])
          )
        );
        const all = results.flat();
        // Deduplicate by product id
        const seen = new Set();
        const unique = all.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        if (active) setProducts(unique);
      } catch (e) {
        if (active) setProducts([]);
        console.error("Product load failed", e);
      } finally {
        if (active) setProductsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [categories, languageId, currencyCode, currencySymbol]);

  // When category selection changes, fetch subcategories for all selected categories
  useEffect(() => {
    if (categoryFilter.length === 0) {
      setSubCategories([]);
      setSubCategoryFilter([]);
      return;
    }
    let active = true;
    const load = async () => {
      try {
        const results = await Promise.all(
          categoryFilter.map((catId) => fetchSubCategoryHomePage(languageId, catId).catch(() => []))
        );
        const seen = new Set();
        const merged = results
          .flat()
          .map((item) => {
            const id = item?.id ?? item?.sub_category_id ?? null;
            const label = item?.sub_category_name ?? item?.name ?? "";
            if (!id || !label) return null;
            return { value: String(id), label: String(label) };
          })
          .filter(Boolean)
          .filter((opt) => {
            if (seen.has(opt.value)) return false;
            seen.add(opt.value);
            return true;
          });
        if (active) {
          setSubCategories(merged);
          setSubCategoryFilter([]);
        }
      } catch (e) {
        if (active) {
          setSubCategories([]);
          setSubCategoryFilter([]);
        }
        console.error("Subcategory load failed", e);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [categoryFilter, languageId]);

  const handleCategoryChange = (values) => {
    setCategoryFilter(Array.isArray(values) ? values : []);
    setSubCategoryFilter([]);
  };

  const displayedProducts = useMemo(() => {
    let list = products;

    if (categoryFilter.length > 0) {
      const catSet = new Set(categoryFilter.map(String));
      list = list.filter((p) => catSet.has(String(p.categoryId)));
    }

    if (subCategoryFilter.length > 0) {
      const subSet = new Set(subCategoryFilter.map(String));
      list = list.filter((p) => subSet.has(String(p.subCategoryId)));
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
  }, [products, categoryFilter, subCategoryFilter, sortFilter]);

  return (
    <div className={styles.page}>
      <SiteHeader availableLanguages={["en"]} fixedLanguage="en" />
      <main className={styles.main}>
        <section className={styles.storyWrap}>
          <Container>
            <div className={styles.topLine} aria-hidden />
            <header className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Lab Grown Diamonds Singapore</h1>
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
                    READ MORE
                  </button>
                </div>
              ) : null}
              <div
                className={`${styles.storyBody} ${!showAllContent ? styles.storyBodyHidden : ""}`}
                id="story-content"
              >
                  <p className={styles.intro}>
                    Lab-grown diamonds are transforming the jewellery world. These diamonds are created in a controlled laboratory environment using advanced lab technology that replicates the natural formation process. The result is a lab-grown diamond with the same brilliance, clarity, and durability as mined diamonds.
                  </p>
                  <p className={styles.intro}>
                   For couples, choosing lab-grown is not only a design decision but a thoughtful commitment to value and responsibility.
                  </p>
                  <figure className={`${styles.storyImage} ${styles.storyImageSmall}`}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/lab_grown_1.jpeg"
                      alt="Lab groen diamond rings Singapore 1"
                      fill
                      sizes="(max-width: 720px) 80vw, 360px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     What Are Lab-Grown Diamonds?
                    </h2>
                 








                    <p className={styles.sectionCopy}>
                       Lab-grown diamonds are real diamonds. A lab-grown diamond has the same chemical, physical, and optical properties as natural diamonds. The only difference is origin: instead of forming deep within the earth, grown diamonds are produced in a laboratory using advanced lab processes.
                    </p>
                    <p className={styles.sectionCopy}>
                    Because lab-grown diamonds are created under controlled conditions, they meet strict quality standards. Each lab-grown diamond is graded for cut, clarity, colour, and carat weight, just like mined diamonds.
                    </p>
                    <p className={styles.sectionCopy}>
                      Lab-grown diamonds are carefully monitored for precision and consistency, offering outstanding brilliance and beauty.

                    </p>
                    <h2 className={styles.storyHeading}>
                    The Difference Between Lab-Grown and Mined Diamonds
                    </h2>
                    <p className={styles.sectionCopy}>
                    Many clients ask about the difference between lab-grown and mined diamonds. In appearance and performance, there is no visible difference. Lab-grown diamonds are chemically identical to natural diamonds.
                    </p>
                    <p className={styles.sectionCopy}>
                      The key distinction lies in origin and cost. Lab-grown diamonds typically offer a more accessible price point compared to mined diamonds of similar quality. This makes a lab-grown diamond an appealing choice for those who value both beauty and financial prudence.
                    </p>
                    <p className={styles.sectionCopy}>
                      Our diamond specialists guide you through the process, ensuring full transparency before your purchase.
                    </p>

                    <h2 className={styles.storyHeading}>
                     Lab Grown Diamond Engagement Rings
                    </h2>
                    <p className={styles.sectionCopy}>
                      For many couples, the most meaningful purchase is a diamond engagement ring. Our lab-grown diamond engagement collection includes timeless engagement ring designs crafted to celebrate love and commitment.
                    </p>
                    <p className={styles.sectionCopy}>
                      A lab-grown diamond engagement ring offers the same brilliance and symbolism as traditional diamond engagement rings, while providing greater flexibility in size and price range.
                    </p>
                    <p className={styles.sectionCopy}>
               Whether you envision a minimalist engagement ring in gold or a statement diamond ring with refined detailing, our lab-grown diamonds allow you to create your dream ring without compromise.
                    </p>
                  </section>

                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/lab_grown_2.jpeg"
                      alt="singapore"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                      Engagement Rings Crafted With Precision
                    </h2>
                    <p className={styles.sectionCopy}>
                     Each engagement ring is designed to honour the heart of your commitment. Our lab-grown diamond engagement rings are available in a range of styles, from classic solitaires to contemporary engagement ring designs.
                    </p>
                    <p className={styles.sectionCopy}>
                     We offer carefully curated options in gold, ensuring that each ring complements the natural beauty of the diamond. The cut of a lab-grown diamond is essential to its brilliance, and we focus on precision proportions to maximise light performance.
                    </p>
                    <p className={styles.sectionCopy}>
                     Our lab-grown diamonds in engagement rings represent a modern expression of love.
                    </p>

                    <h2 className={styles.storyHeading}>
                      Beyond Engagement Rings: A Complete Jewellery Collection
                    </h2>
                    <p className={styles.sectionCopy}>
                      Our lab-grown diamonds are not limited to engagement ring pieces. We present a refined collection of diamond rings, earrings, necklaces, pendants, bracelets, and tennis bracelets.
                    </p>
                    <p className={styles.sectionCopy}>
                      From elegant diamond earrings to delicate pendants and statement necklaces, each piece showcases the brilliance of lab-grown diamonds. Our showroom displays a curated selection of products crafted with care and precision.
                    </p>
                    <p className={styles.sectionCopy}>
                    Lab-grown diamonds in Singapore are increasingly chosen for anniversary jewellery, milestone gifts, and personal pieces that celebrate life’s joy.
                    </p>
                  </section>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    Is It Worth Buying A Lab-Grown Diamond?
                    </h2>
                    <p className={styles.sectionCopy}>
                     Absolutely. Lab-grown diamonds are worth buying for clients who prioritise value, transparency, and modern craftsmanship. Lab-grown diamonds are identical in composition to mined diamonds, offering the same beauty and durability.
                    </p>
                    <p className={styles.sectionCopy}>
                    Because lab-grown diamonds typically have a lower cost per carat, you can select a larger diamond or higher clarity within your preferred price range. For many couples, this makes a lab-grown diamond the right decision for both emotional and practical reasons.


                    </p>
                   
                  </section>

                 

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                     How Much Is A 1 Carat Lab Diamond Worth?
                    </h2>
                    <p className={styles.sectionCopy}>
                      In Singapore, the price of a 1-carat lab-grown diamond varies depending on cut, clarity, and colour. Generally, a 1-carat lab-grown diamond may range from a few thousand Singapore dollars, significantly below the cost of comparable mined diamonds.
                    </p>
                    <p className={styles.sectionCopy}>
                     The final price depends on quality standards and market conditions. Our lab-grown diamonds are carefully selected to ensure exceptional value without sacrificing brilliance.
                    </p>
                    
                  </section>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                    How Much Is A 4 Carat Lab-Grown Diamond In Singapore?
                    </h2>
                    <p className={styles.sectionCopy}>
                     A 4-carat lab-grown diamond in Singapore can vary widely in price depending on cut precision, clarity, and colour grading. Compared to mined diamonds, lab-grown diamonds at this size offer remarkable savings.
                    </p>
                    <p className={styles.sectionCopy}>
                      At Korkeila Helsinki, our lab-grown diamonds are evaluated individually. Larger grown diamonds allow clients to achieve impressive visual impact while remaining within a defined price point.
                    </p>
                    <p className={styles.sectionCopy}>
                      We encourage booking an appointment in our showroom to explore the available stock and understand the full price range.
                    </p>
                  </section>
                  <figure className={styles.storyImage}>
                    <Image
                      src="https://imagesweb2026.s3.eu-north-1.amazonaws.com/lab_grown_1.jpeg"
                      alt="diamond ring Singapore"
                      fill
                      sizes="(max-width: 960px) 100vw, 720px"
                    />
                  </figure>

                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                       Is It A Good Time To Buy Lab-Grown Diamonds?
                    </h2>
                    <p className={styles.sectionCopy}>
                    Lab-grown diamonds continue to evolve in technology and accessibility. For many, it is a favourable time to purchase because quality has increased while cost remains competitive.                    </p>
                    <p className={styles.sectionCopy}>
                      The stability of lab production ensures a consistent supply and transparent pricing. This makes lab-grown diamonds an attractive option for engagement rings and fine jewellery.
                    </p>
                  
                  </section>
                  <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                   The Purchase Process And Personal Guidance
                    </h2>
                    <p className={styles.sectionCopy}>
                     Choosing a lab-grown diamond is a meaningful process. We guide you from selection to final purchase, ensuring clarity and confidence at every step.
                    </p>
                    <p className={styles.sectionCopy}>
                      During your showroom appointment, our diamond specialists explain the difference between various lab-grown options, helping you select the ideal diamond shape and design.
                    </p>
                    <p className={styles.sectionCopy}>
                     Customer satisfaction is central to our philosophy. Whether you seek a lab-grown diamond engagement ring or a refined piece of jewellery for a loved one, we ensure the experience reflects the joy of your commitment.
                    </p>
                  </section>



                   <section className={styles.storySection}>
                    <h2 className={styles.storyHeading}>
                        Discover Our Lab-Grown Diamonds
                    </h2>
                    <p className={styles.sectionCopy}>
                     Our lab-grown diamonds collection is available for viewing by appointment in our Singapore showroom. On our website, you can explore products and request guidance before visiting.
                    </p>
                    <p className={styles.sectionCopy}>
                     From engagement ring pieces to earrings, necklaces, pendants, bracelets and diamond rings, our lab-grown diamonds are crafted to meet exceptional quality standards.
                    </p>
                    <p className={styles.sectionCopy}>
                     If you are searching for something meaningful, our lab-grown diamonds offer beauty, brilliance, and enduring value. Browse our online store or book an appointment, and discover how a lab-grown diamond can become the centrepiece of your love story.
                    </p>
                  </section>

                </div>

              {showAllContent ? (
                <div className={styles.toggleRow}>
                  <button
                    className={styles.toggleButton}
                    type="button"
                    onClick={() => setShowAllContent((prev) => !prev)}
                    aria-expanded={showAllContent}
                    aria-controls="story-content"
                  >
                    Show less
                  </button>
                </div>
              ) : null}

              <section className={styles.productSection}>
                <Container className={styles.productContainer}>
                  <div className={styles.filtersRow}>
                    <div className={styles.filtersBarWrap}>
                      <FiltersBar
                        leftLabel={labels.category}
                        centerLabel={labels.subCategory}
                        rightLabel={labels.sortByPrice}
                        leftValue={categoryFilter}
                        centerValue={subCategoryFilter}
                        rightValue={sortFilter}
                        onLeftChange={handleCategoryChange}
                        onCenterChange={(vals) => setSubCategoryFilter(Array.isArray(vals) ? vals : [])}
                        onRightChange={setSortFilter}
                        leftOptions={categories}
                        centerOptions={subCategories}
                        rightOptions={sortFilterOptions}
                        leftMulti
                        centerMulti
                        centerDisabled={categoryFilter.length === 0}
                      />
                    </div>
                  </div>
                  <div className={styles.gridWrap}>
                    <ProductGrid
                      products={displayedProducts}
                      columns={3}
                      loading={productsLoading}
                    />
                  </div>
                </Container>
              </section>
            </article>
          </Container>
        </section>
      </main>
      <SiteFooter brandDescription={en.footer.homeBrandDescription} fixedLanguage="en" />
    </div>
  );
}
